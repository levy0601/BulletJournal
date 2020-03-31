package com.bulletjournal.controller;

import com.bulletjournal.clients.UserClient;
import com.bulletjournal.controller.models.*;
import com.bulletjournal.controller.utils.EtagGenerator;
import com.bulletjournal.es.SearchService;
import com.bulletjournal.notifications.Event;
import com.bulletjournal.notifications.NotificationService;
import com.bulletjournal.notifications.RemoveNoteEvent;
import com.bulletjournal.repository.NoteDaoJpa;
import com.bulletjournal.repository.models.NoteContent;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.stream.Collectors;

@RestController
public class NoteController {

    protected static final String NOTES_ROUTE = "/api/projects/{projectId}/notes";
    protected static final String NOTE_ROUTE = "/api/notes/{noteId}";
    protected static final String NOTE_SET_LABELS_ROUTE = "/api/notes/{noteId}/setLabels";
    protected static final String MOVE_NOTE_ROUTE = "/api/notes/{noteId}/move";
    protected static final String SHARE_NOTE_ROUTE = "/api/notes/{noteId}/share";
    protected static final String ADD_CONTENT_ROUTE = "/api/notes/{noteId}/addContent";
    protected static final String CONTENT_ROUTE = "/api/notes/{noteId}/contents/{contentId}";
    protected static final String CONTENTS_ROUTE = "/api/notes/{noteId}/contents";
    protected static final String CONTENT_REVISIONS_ROUTE = "/api/notes/{noteId}/contents/{contentId}/revisions";

    @Autowired
    private NoteDaoJpa noteDaoJpa;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserClient userClient;

    @Autowired
    private SearchService searchService;

    @GetMapping(NOTES_ROUTE)
    public ResponseEntity<List<Note>> getNotes(@NotNull @PathVariable Long projectId) {
        String username = MDC.get(UserClient.USER_NAME_KEY);
        List<Note> notes = this.noteDaoJpa.getNotes(projectId, username)
                .stream().map(n -> addAvatar(n)).collect(Collectors.toList());
        String notesEtag = EtagGenerator.generateEtag(EtagGenerator.HashAlgorithm.MD5,
                EtagGenerator.HashType.TO_HASHCODE, notes);

        HttpHeaders responseHeader = new HttpHeaders();
        responseHeader.setETag(notesEtag);

        return ResponseEntity.ok().headers(responseHeader).body(notes);
    }

    private Note addAvatar(Note note) {
        note.setOwnerAvatar(this.userClient.getUser(note.getOwner()).getAvatar());
        if (note.getSubNotes() != null) {
            for (Note subNote : note.getSubNotes()) {
                addAvatar(subNote);
            }
        }
        return note;
    }

    @PostMapping(NOTES_ROUTE)
    @ResponseStatus(HttpStatus.CREATED)
    public Note createNote(@NotNull @PathVariable Long projectId,
                           @Valid @RequestBody CreateNoteParams note) {
        String username = MDC.get(UserClient.USER_NAME_KEY);
        Note createdNote = noteDaoJpa.create(projectId, username, note).toPresentationModel();
        searchService.saveToES(createdNote, username);
        return createdNote;
    }

    @GetMapping(NOTE_ROUTE)
    public Note getNote(@NotNull @PathVariable Long noteId) {
        String username = MDC.get(UserClient.USER_NAME_KEY);
        return addAvatar(this.noteDaoJpa.getNote(username, noteId));
    }

    @PatchMapping(NOTE_ROUTE)
    public ResponseEntity<List<Note>> updateNote(@NotNull @PathVariable Long noteId,
                                                 @Valid @RequestBody UpdateNoteParams updateNoteParams) {
        String username = MDC.get(UserClient.USER_NAME_KEY);
        Note note = this.noteDaoJpa.partialUpdate(username, noteId, updateNoteParams).toPresentationModel();
        return getNotes(note.getProjectId());
    }

    @DeleteMapping(NOTE_ROUTE)
    public ResponseEntity<List<Note>> deleteNote(@NotNull @PathVariable Long noteId) {
        String username = MDC.get(UserClient.USER_NAME_KEY);
        Note note = getNote(noteId);
        List<Event> events = this.noteDaoJpa.deleteNote(username, noteId);
        if (!events.isEmpty()) {
            this.notificationService.inform(new RemoveNoteEvent(events, username));
        }
        return getNotes(note.getProjectId());
    }

    @PutMapping(NOTES_ROUTE)
    public ResponseEntity<List<Note>> updateNoteRelations(@NotNull @PathVariable Long projectId, @Valid @RequestBody List<Note> notes) {
        this.noteDaoJpa.updateUserNotes(projectId, notes);
        return getNotes(projectId);
    }

    @PutMapping(NOTE_SET_LABELS_ROUTE)
    public Note setLabels(@NotNull @PathVariable Long noteId,
                          @NotNull @RequestBody List<Long> labels) {
        String username = MDC.get(UserClient.USER_NAME_KEY);
        this.notificationService.inform(this.noteDaoJpa.setLabels(username, noteId, labels));
        return getNote(noteId);
    }

    @PostMapping(MOVE_NOTE_ROUTE)
    public void moveNote(@NotNull @PathVariable Long noteId,
                         @NotNull @RequestBody MoveProjectItemParams moveProjectItemParams) {
        String username = MDC.get(UserClient.USER_NAME_KEY);
        this.noteDaoJpa.move(username, noteId, moveProjectItemParams.getTargetProject());
    }

    @PostMapping(SHARE_NOTE_ROUTE)
    public String shareNote(
            @NotNull @PathVariable Long noteId,
            @NotNull @RequestBody ShareProjectItemParams shareProjectItemParams) {
        String username = MDC.get(UserClient.USER_NAME_KEY);
        this.noteDaoJpa.shareProjectItem(noteId, shareProjectItemParams, username);
        return null; // may be generated link
    }

    @PostMapping(ADD_CONTENT_ROUTE)
    public Content addContent(@NotNull @PathVariable Long noteId,
                              @NotNull @RequestBody CreateContentParams createContentParams) {
        String username = MDC.get(UserClient.USER_NAME_KEY);
        return this.noteDaoJpa.addContent(noteId, username, new NoteContent(createContentParams.getText()))
                .toPresentationModel();
    }

    @GetMapping(CONTENTS_ROUTE)
    public List<Content> getContents(@NotNull @PathVariable Long noteId) {
        String username = MDC.get(UserClient.USER_NAME_KEY);
        return this.noteDaoJpa.getContents(noteId, username).stream()
                .map(t -> {
                    Content content = t.toPresentationModel();
                    content.setOwnerAvatar(this.userClient.getUser(content.getOwner()).getAvatar());
                    return content;
                })
                .collect(Collectors.toList());
    }

    @DeleteMapping(CONTENT_ROUTE)
    public List<Content> deleteContent(@NotNull @PathVariable Long noteId,
                                       @NotNull @PathVariable Long contentId) {
        String username = MDC.get(UserClient.USER_NAME_KEY);
        this.noteDaoJpa.deleteContent(contentId, noteId, username);
        return getContents(noteId);
    }

    @PatchMapping(CONTENT_ROUTE)
    public List<Content> updateContent(@NotNull @PathVariable Long noteId,
                                       @NotNull @PathVariable Long contentId,
                                       @NotNull @RequestBody UpdateContentParams updateContentParams) {
        String username = MDC.get(UserClient.USER_NAME_KEY);
        this.noteDaoJpa.updateContent(contentId, noteId, username, updateContentParams);
        return getContents(noteId);
    }

    @GetMapping(CONTENT_REVISIONS_ROUTE)
    public List<Revision> getContentRevisions(
            @NotNull @PathVariable Long noteId,
            @NotNull @PathVariable Long contentId) {
        return null;
    }
}