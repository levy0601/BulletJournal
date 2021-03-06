package com.bulletjournal.repository;

import com.bulletjournal.repository.models.CompletedTask;
import com.bulletjournal.repository.models.Project;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;

@Repository
public interface CompletedTaskRepository extends JpaRepository<CompletedTask, Long> {
    List<CompletedTask> findCompletedTaskByProject(Project project, Pageable pageable);

    @Query("SELECT completedTask FROM CompletedTask completedTask WHERE completedTask.project = :project AND "
            + "completedTask.createdAt >= :startTime AND completedTask.createdAt <= :endTime")
    List<CompletedTask> findCompletedTaskBetween(@Param("project") Project project,
                                                 @Param("startTime") Timestamp startTime, @Param("endTime") Timestamp endTime);

    @Query(value = "SELECT * FROM completed_tasks WHERE completed_tasks.project_id = :projectId AND "
            + "completed_tasks.created_at >= :startTime AND completed_tasks.created_at <= :endTime AND "
            + ":assignee = ANY(completed_tasks.assignees)", nativeQuery = true)
    List<CompletedTask> findCompletedTaskByAssigneeBetween(@Param("projectId") Long projectId,
                                                           @Param("assignee") String assignee, @Param("startTime") Timestamp startTime,
                                                           @Param("endTime") Timestamp endTime);

}
