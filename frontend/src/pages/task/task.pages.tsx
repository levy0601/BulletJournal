// page display contents of tasks
// react imports
import React, {useState} from 'react';
import {useHistory, useParams} from 'react-router-dom';
import {connect} from 'react-redux';
// features
//actions
import {completeTask, deleteTask, getTask, updateTaskContents} from '../../features/tasks/actions';
import {IState} from '../../store';
// antd imports
import {Avatar, Button, Popconfirm, Popover, Tooltip} from 'antd';
import {CheckCircleTwoTone, DeleteTwoTone, PlusCircleTwoTone, SyncOutlined, UpSquareOutlined} from '@ant-design/icons';
// modals import
import EditTask from '../../components/modals/edit-task.component';
import MoveProjectItem from '../../components/modals/move-project-item.component';
import ShareProjectItem from '../../components/modals/share-project-item.component';

import './task-page.styles.less';
import 'braft-editor/dist/index.css';
import {ProjectItemUIType, ProjectType} from '../../features/project/constants';
// components
import TaskDetailPage, {TaskProps} from './task-detail.pages';
import ContentEditorDrawer from '../../components/content-editor/content-editor-drawer.component';
import LabelManagement from '../project/label-management.compoent';

interface TaskPageHandler {
  getTask: (taskId: number) => void;
  deleteTask: (taskId: number, type: ProjectItemUIType) => void;
  updateTaskContents: (taskId: number) => void;
  completeTask: (taskId: number, type: ProjectItemUIType, dateTime?: string) => void;
}

const TaskPage: React.FC<TaskPageHandler & TaskProps> = (props) => {
  const { task, deleteTask, updateTaskContents, getTask, contents, completeTask } = props;
  // get id of task from router
  const { taskId } = useParams();
  // state control drawer displaying
  const [showEditor, setEditorShow] = useState(false);
  const [labelEditable, setLabelEditable] = useState(false);
  // hook history in router
  const history = useHistory();

  // listening on the empty state working as componentDidmount
  React.useEffect(() => {
    taskId && getTask(parseInt(taskId));
  }, [taskId]);

  React.useEffect(() => {
    task && task.id && updateTaskContents(task.id);
  }, [task]);

  if (!task) return null;
  // show drawer
  const createHandler = () => {
    setEditorShow(true);
  };

  const handleClose = () => {
    setEditorShow(false);
  };

  const labelEditableHandler = () => {
    setLabelEditable((labelEditable) => !labelEditable);
  };

  const handleRefresh = () => {
    task && task.id && updateTaskContents(task.id);
    taskId && getTask(parseInt(taskId));
  };

  const createContentElem = (
    <Button onClick={createHandler}>
      <PlusCircleTwoTone />
      New
    </Button>
  );

  const taskEditorElem = (
    <div className='task-drawer'>
      <ContentEditorDrawer
        readMode={false}
        projectItem={task}
        visible={showEditor}
        onClose={handleClose}
      />
    </div>
  );

  const getAssignees = () => {
    if (!task.assignees || task.assignees.length === 0) {
      return null;
    }

    if (task.assignees.length === 1) {
      return (
        <Tooltip title={`Assignee ${task.assignees[0].alias}`}>
          <div className='task-owner'>
            <Avatar src={task.assignees[0].avatar} />
          </div>
        </Tooltip>
      );
    }

    return (
      <Popover
        title='Assignees'
        placement='bottom'
        content={
          <div>
            {task.assignees.map((u, index) => (
              <p key={index}>
                <Avatar size='small' src={u.avatar} />
                &nbsp;{u.alias}
              </p>
            ))}
          </div>
        }
      >
        <div className='task-owner'>
          <Avatar src={task.assignees[0].avatar} />
        </div>
      </Popover>
    );
  };

  const handleCompleteTaskClick = () => {
      completeTask(task.id, ProjectItemUIType.PAGE);
      history.push(`/projects/${task.projectId}`);
  };

  const taskOperation = () => {
    return (
      <div className='task-operation'>
        {getAssignees()}

        <LabelManagement
          labelEditableHandler={labelEditableHandler}
          labelEditable={labelEditable}
        />
        <EditTask task={task} mode='icon' />
        <MoveProjectItem
          type={ProjectType.TODO}
          projectItemId={task.id}
          mode='icon'
        />
        <ShareProjectItem
          type={ProjectType.TODO}
          projectItemId={task.id}
          mode='icon'
        />
        <Tooltip title='Delete'>
          <Popconfirm
            title='Deleting Task also deletes its child tasks. Are you sure?'
            okText='Yes'
            cancelText='No'
            onConfirm={() => {
              deleteTask(task.id, ProjectItemUIType.PAGE);
              history.goBack();
            }}
            className='group-setting'
            placement='bottom'
          >
            <div>
              <DeleteTwoTone twoToneColor='#f5222d' />
            </div>
          </Popconfirm>
        </Tooltip>
        <Tooltip title='Refresh Contents'>
          <div>
            <SyncOutlined onClick={handleRefresh} />
          </div>
        </Tooltip>
        <Tooltip title='Complete Task'>
          <div>
            <CheckCircleTwoTone twoToneColor='#52c41a'
                                onClick={() => handleCompleteTaskClick()}/>
          </div>
        </Tooltip>
        <Tooltip title='Go to Parent BuJo'>
          <div>
            <UpSquareOutlined
              onClick={(e) => history.push(`/projects/${task.projectId}`)}
            />
          </div>
        </Tooltip>
      </div>
    );
  };

  return (
    <TaskDetailPage
      task={task}
      labelEditable={labelEditable}
      taskOperation={taskOperation}
      contents={contents}
      createContentElem={createContentElem}
      taskEditorElem={taskEditorElem}
    />
  );
};

const mapStateToProps = (state: IState) => ({
  task: state.task.task,
  contents: state.task.contents,
});

export default connect(mapStateToProps, {
  deleteTask,
  getTask,
  updateTaskContents,
  completeTask
})(TaskPage);
