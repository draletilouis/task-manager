import React, { useState } from 'react';
import { useWorkspaces } from '../../hooks/useWorkspaces';
import WorkspaceCard from '../../components/workspace/WorkspaceCard';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';

const WorkspacesPage = () => {
  const { workspaces, loading, error, addWorkspace } = useWorkspaces();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addWorkspace(formData);
      setShowModal(false);
      setFormData({ name: '', description: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Workspaces</h1>
        <Button onClick={() => setShowModal(true)}>Create Workspace</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map(workspace => (
          <WorkspaceCard key={workspace.id} workspace={workspace} />
        ))}
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <h2 className="text-2xl mb-4">Create Workspace</h2>
            <input
              type="text"
              placeholder="Workspace Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-2 border rounded mb-4"
              required
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full p-2 border rounded mb-4"
            />
            <Button type="submit">Create</Button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default WorkspacesPage;