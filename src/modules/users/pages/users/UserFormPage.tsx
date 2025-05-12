
import React from "react";

interface UserFormPageProps {
  mode: "create" | "edit";
}

const UserFormPage: React.FC<UserFormPageProps> = ({ mode }) => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">
        {mode === "create" ? "Create New User" : "Edit User"}
      </h1>
      {/* Form will be implemented here */}
      <div className="bg-white rounded-md shadow p-6">
        <p>User {mode === "create" ? "creation" : "edit"} form will be implemented here.</p>
      </div>
    </div>
  );
};

export default UserFormPage;
