import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Folder, Plus, CheckCircle2, Clock } from 'lucide-react';
import TaskCard from '../components/TaskCard';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Project State
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, tasksRes] = await Promise.all([
          axios.get('/api/projects', { headers: { Authorization: `Bearer ${user.token}` } }),
          axios.get('/api/tasks/me', { headers: { Authorization: `Bearer ${user.token}` } })
        ]);
        setProjects(projectsRes.data);
        setMyTasks(tasksRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.token]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/projects', 
        { title: newProjectTitle, description: newProjectDesc },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setProjects([...projects, res.data]);
      setShowNewProject(false);
      setNewProjectTitle('');
      setNewProjectDesc('');
    } catch (error) {
      console.error(error);
      alert('Failed to create project');
    }
  };

  const onTaskUpdate = (updatedTask) => {
    setMyTasks(myTasks.map(t => t._id === updatedTask._id ? updatedTask : t));
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  const pendingTasks = myTasks.filter(t => t.status !== 'Completed');
  const completedTasks = myTasks.filter(t => t.status === 'Completed');

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600">
            <Folder className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Projects</p>
            <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pending Tasks</p>
            <p className="text-2xl font-bold text-gray-900">{pendingTasks.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-lg text-green-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Completed Tasks</p>
            <p className="text-2xl font-bold text-gray-900">{completedTasks.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Projects List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Your Projects</h2>
            {user.role === 'Admin' && (
              <button 
                onClick={() => setShowNewProject(!showNewProject)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> New Project
              </button>
            )}
          </div>

          {showNewProject && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-semibold mb-4">Create New Project</h3>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <input
                  type="text"
                  placeholder="Project Title"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <textarea
                  placeholder="Description"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                  rows="3"
                />
                <div className="flex gap-2">
                  <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700">Create</button>
                  <button type="button" onClick={() => setShowNewProject(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm hover:bg-gray-300">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.length === 0 ? (
              <p className="text-gray-500 col-span-2">No projects found.</p>
            ) : (
              projects.map(project => (
                <Link to={`/project/${project._id}`} key={project._id} className="block group">
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-300 hover:shadow-md transition-all">
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">{project.title}</h3>
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">{project.description || 'No description'}</p>
                    <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-500">
                      <span>{project.members?.length || 0} Members</span>
                      <span>By {project.createdBy?.name}</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* My Tasks Sidebar */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">My Pending Tasks</h2>
          <div className="flex flex-col gap-4">
            {pendingTasks.length === 0 ? (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
                You're all caught up!
              </div>
            ) : (
              pendingTasks.slice(0, 5).map(task => (
                <TaskCard 
                  key={task._id} 
                  task={task} 
                  onTaskUpdate={onTaskUpdate}
                  onTaskDelete={() => {}} // User shouldn't delete from here directly unless admin
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
