import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getTask, updateTask, deleteTask } from '../../api/tasks';
import { useComments } from '../../hooks/useComments';
import Modal from '../../components/common/Modal';
import TaskForm from '../../components/task/TaskForm';
import CommentList from '../../components/comment/CommentList';
import CommentForm from '../../components/comment/CommentForm';
import Button from '../../components/common/Button';

const TaskDetail = () => {
  const { workspaceId, projectId, taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { comments, loading: commentsLoading, addComment, editComment, removeComment } = useComments(taskId);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const data = await getTask(workspaceId, projectId, taskId);
      setTask(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [workspaceId, projectId, taskId]);

  const handleEditTask = async (taskData) => {
    try {
      const updated = await updateTask(workspaceId, projectId, taskId, taskData);
      setTask(updated);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('Failed to update task: ' + error.message);
    }
  };

  const handleDeleteTask = async () => {
    try {
      await deleteTask(workspaceId, projectId, taskId);
      navigate(`/workspaces/${workspaceId}/projects/${projectId}`);
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task: ' + error.message);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const updated = await updateTask(workspaceId, projectId, taskId, {
        ...task,
        status: newStatus
      });
      setTask(updated);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status: ' + error.message);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      const updated = await updateTask(workspaceId, projectId, taskId, {
        ...task,
        priority: newPriority
      });
      setTask(updated);
    } catch (error) {
      console.error('Failed to update priority:', error);
      alert('Failed to update priority: ' + error.message);
    }
  };

  const handleAddComment = async (commentData) => {
    try {
      await addComment(commentData);
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-gray-500">Loading task...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-gray-500">Task not found</div>
      </div>
    );
  }

  const statusStyles = {
    TODO: { color: 'bg-gray-200 text-gray-800', label: 'To Do' },
    IN_PROGRESS: { color: 'bg-yellow-200 text-yellow-800', label: 'In Progress' },
    DONE: { color: 'bg-green-200 text-green-800', label: 'Done' }
  };

  const priorityColors = {
    LOW: 'bg-green-500',
    MEDIUM: 'bg-yellow-500',
    HIGH: 'bg-red-500'
  };

  return (
    <div className="container mx-auto p-6">
      {/* Breadcrumb Navigation */}
      <nav className="text-sm mb-4 text-gray-600">
        <Link to="/workspaces" className="hover:text-blue-600">Workspaces</Link>
        <span className="mx-2">/</span>
        <Link to={`/workspaces/${workspaceId}`} className="hover:text-blue-600">Workspace</Link>
        <span className="mx-2">/</span>
        <Link to={`/workspaces/${workspaceId}/projects/${projectId}`} className="hover:text-blue-600">Project</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Task</span>
      </nav>

      {/* Task Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{task.title}</h1>
            <div className="flex items-center gap-3">
              {/* Priority Indicator */}
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${priorityColors[task.priority]}`}></span>
                <span className="text-sm text-gray-600">{task.priority}</span>
              </div>
              {/* Status Badge */}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[task.status].color}`}>
                {statusStyles[task.status].label}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsEditModalOpen(true)} variant="secondary">
              Edit
            </Button>
            <Button onClick={() => setIsDeleteModalOpen(true)} variant="danger">
              Delete
            </Button>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Description</h2>
          <p className="text-gray-600">{task.description || 'No description provided'}</p>
        </div>

        {/* Due Date */}
        {task.dueDate && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Due Date</h2>
            <p className="text-gray-600">📅 {new Date(task.dueDate).toLocaleDateString()}</p>
          </div>
        )}

        {/* Assignee */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Assigned To</h2>
          <p className="text-gray-600">
            {task.assignee ? (
              <span className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                  {task.assignee.email?.charAt(0).toUpperCase() || '?'}
                </span>
                {task.assignee.email || 'Unknown User'}
              </span>
            ) : (
              'Unassigned'
            )}
          </p>
        </div>

        {/* Status Update */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Update Status</h2>
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusChange('TODO')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                task.status === 'TODO' ? 'bg-gray-300 text-gray-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              To Do
            </button>
            <button
              onClick={() => handleStatusChange('IN_PROGRESS')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                task.status === 'IN_PROGRESS' ? 'bg-yellow-300 text-yellow-800' : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => handleStatusChange('DONE')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                task.status === 'DONE' ? 'bg-green-300 text-green-800' : 'bg-green-100 text-green-600 hover:bg-green-200'
              }`}
            >
              Done
            </button>
          </div>
        </div>

        {/* Priority Update */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Update Priority</h2>
          <div className="flex gap-2">
            <button
              onClick={() => handlePriorityChange('LOW')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                task.priority === 'LOW' ? 'bg-green-300 text-green-800' : 'bg-green-100 text-green-600 hover:bg-green-200'
              }`}
            >
              Low
            </button>
            <button
              onClick={() => handlePriorityChange('MEDIUM')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                task.priority === 'MEDIUM' ? 'bg-yellow-300 text-yellow-800' : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => handlePriorityChange('HIGH')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                task.priority === 'HIGH' ? 'bg-red-300 text-red-800' : 'bg-red-100 text-red-600 hover:bg-red-200'
              }`}
            >
              High
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Comments ({comments.length})
        </h2>

        {/* Add Comment Form */}
        <div className="mb-6">
          <CommentForm onSubmit={handleAddComment} />
        </div>

        {/* Comments List */}
        <CommentList
          comments={comments}
          loading={commentsLoading}
          onEdit={editComment}
          onDelete={removeComment}
        />
      </div>

      {/* Edit Task Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Task"
      >
        <TaskForm
          onSubmit={handleEditTask}
          onCancel={() => setIsEditModalOpen(false)}
          initialData={task}
          workspaceId={workspaceId}
          projectId={projectId}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Task"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this task? This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <Button
              onClick={() => setIsDeleteModalOpen(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button onClick={handleDeleteTask} variant="danger">
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TaskDetail;
