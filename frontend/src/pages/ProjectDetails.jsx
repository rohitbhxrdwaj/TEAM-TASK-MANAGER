import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Plus, Users } from 'lucide-react';
import TaskCard from '../components/TaskCard';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  // New Task Form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');

  // Add Member
  const [selectedMember, setSelectedMember] = useState('');

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const [projRes, tasksRes] = await Promise.all([
          axios.get(`/api/projects/${id}`, { headers: { Authorization: `Bearer ${user.token}` } }),
          axios.get(`/api/tasks/project/${id}`, { headers: { Authorization: `Bearer ${user.token}` } })
        ]);
        setProject(projRes.data);
        setTasks(tasksRes.data);

        if (user.role === 'Admin') {
          const usersRes = await axios.get('/api/auth/users', { headers: { Authorization: `Bearer ${user.token}` } });
          setAllUsers(usersRes.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjectData();
  }, [id, user.token, user.role]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: taskTitle,
        description: taskDesc,
        project: id,
        assignedTo: taskAssignee || null
      };
      const res = await axios.post('/api/tasks', payload, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      // Re-fetch tasks to get populated assignee details
      const tasksRes = await axios.get(`/api/tasks/project/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
      setTasks(tasksRes.data);
      
      setShowTaskModal(false);
      setTaskTitle('');
      setTaskDesc('');
      setTaskAssignee('');
    } catch (error) {
      console.error(error);
      alert('Failed to create task');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      if (!selectedMember) return;
      const memberIds = project.members.map(m => m._id);
      if (memberIds.includes(selectedMember)) {
        alert('User is already a member');
        return;
      }
      
      const res = await axios.put(`/api/projects/${id}`, 
        { members: [...memberIds, selectedMember] },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setProject(res.data);
      setShowMemberModal(false);
    } catch (error) {
      console.error(error);
      alert('Failed to add member');
    }
  };

  const onTaskUpdate = (updatedTask) => {
    setTasks(tasks.map(t => t._id === updatedTask._id ? updatedTask : t));
  };

  const onTaskDelete = (taskId) => {
    setTasks(tasks.filter(t => t._id !== taskId));
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!project) return <div className="text-center py-10">Project not found or access denied.</div>;

  const isAdmin = user.role === 'Admin';
  const isCreator = project.createdBy._id === user._id;

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
          <p className="text-gray-500 mt-1">{project.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
            <Users className="w-4 h-4" />
            {project.members.length} Members
          </div>
          {isAdmin && isCreator && (
            <button 
              onClick={() => setShowMemberModal(true)}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              + Add Member
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Tasks</h2>
          {isAdmin && isCreator && (
            <button 
              onClick={() => setShowTaskModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Task
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.length === 0 ? (
             <div className="col-span-full text-center py-10 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
               No tasks yet.
             </div>
          ) : (
            tasks.map(task => (
              <TaskCard 
                key={task._id} 
                task={task} 
                onTaskUpdate={onTaskUpdate} 
                onTaskDelete={onTaskDelete} 
              />
            ))
          )}
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <input
                type="text"
                placeholder="Task Title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                required
              />
              <textarea
                placeholder="Description"
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                rows="3"
              />
              <select
                value={taskAssignee}
                onChange={(e) => setTaskAssignee(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">-- Assign to Member --</option>
                {project.members.map(m => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 font-medium">Create Task</button>
                <button type="button" onClick={() => setShowTaskModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200 font-medium">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4">Add Member to Project</h3>
            <form onSubmit={handleAddMember} className="space-y-4">
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 bg-white"
                required
              >
                <option value="">-- Select User --</option>
                {allUsers.filter(u => u._id !== user._id).map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                ))}
              </select>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 font-medium">Add</button>
                <button type="button" onClick={() => setShowMemberModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200 font-medium">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
