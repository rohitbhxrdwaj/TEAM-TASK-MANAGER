import { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { CheckCircle2, Clock, PlayCircle, Trash2 } from 'lucide-react';

const statusColors = {
  'Pending': 'bg-gray-100 text-gray-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  'Completed': 'bg-green-100 text-green-800'
};

const statusIcons = {
  'Pending': <Clock className="w-4 h-4" />,
  'In Progress': <PlayCircle className="w-4 h-4" />,
  'Completed': <CheckCircle2 className="w-4 h-4" />
};

const TaskCard = ({ task, onTaskUpdate, onTaskDelete }) => {
  const { user } = useContext(AuthContext);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (e) => {
    try {
      setUpdating(true);
      const res = await axios.put(`/api/tasks/${task._id}`, 
        { status: e.target.value },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      onTaskUpdate(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await axios.delete(`/api/tasks/${task._id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      onTaskDelete(task._id);
    } catch (err) {
      console.error(err);
      alert('Failed to delete task');
    }
  };

  const isAssignee = task.assignedTo && task.assignedTo._id === user._id;
  const isCreatorOrAdmin = user.role === 'Admin';
  
  const canUpdateStatus = isCreatorOrAdmin || isAssignee;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <h4 className="font-semibold text-gray-900">{task.title}</h4>
        {user.role === 'Admin' && (
          <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
      
      <div className="flex justify-between items-center mt-auto pt-2">
        <div className="flex items-center gap-2">
           <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[task.status]}`}>
            {statusIcons[task.status]}
            {task.status}
          </span>
        </div>
        
        {task.assignedTo && (
           <span className="text-xs text-gray-500 font-medium">
             Assigned to: {task.assignedTo.name}
           </span>
        )}
      </div>

      {canUpdateStatus && (
        <div className="mt-2 pt-3 border-t border-gray-50">
          <select 
            value={task.status} 
            onChange={handleStatusChange}
            disabled={updating}
            className="text-xs bg-gray-50 border border-gray-200 text-gray-700 rounded p-1.5 w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
