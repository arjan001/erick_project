import React from 'react';
import { FileText, Video, Scissors, Music, Wand2, Box, Headphones, Code } from 'lucide-react';

const DEPARTMENTS = [
  { value: 'preproduction', label: 'Pre-production', icon: FileText, description: 'Scripting, planning, casting' },
  { value: 'production', label: 'Production', icon: Video, description: 'Filming, photography' },
  { value: 'post', label: 'Post Production', icon: Scissors, description: 'Editing, color, finishing' },
  { value: 'sound', label: 'Sound', icon: Headphones, description: 'Sound design and mixing' },
  { value: 'vfx', label: 'VFX', icon: Wand2, description: 'Visual effects' },
  { value: '3d', label: '3D', icon: Box, description: '3D animation and CGI' },
  { value: 'music', label: 'Music', icon: Music, description: 'Original composition' },
  { value: 'web_development', label: 'Web Development', icon: Code, description: 'Marketing websites' },
];

export default function StepDepartments({ data, updateData }) {
  const toggleDepartment = (value) => {
    const current = data.departments_needed || [];
    if (current.includes(value)) {
      updateData('departments_needed', current.filter(d => d !== value));
    } else {
      updateData('departments_needed', [...current, value]);
    }
  };

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-black">What services do you need?</h2>
      <p className="text-gray-600 mb-8">Select all departments required</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {DEPARTMENTS.map((dept) => {
          const Icon = dept.icon;
          const isSelected = (data.departments_needed || []).includes(dept.value);
          return (
            <button
              key={dept.value}
              onClick={() => toggleDepartment(dept.value)}
              className={`p-5 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? 'border-amber-600 bg-amber-600/10'
                  : 'border-gray-300 hover:border-gray-400 bg-white'
              }`}
            >
              <Icon className={`w-7 h-7 mb-3 ${isSelected ? 'text-amber-600' : 'text-gray-600'}`} />
              <h3 className="text-base font-semibold mb-1 text-black">{dept.label}</h3>
              <p className="text-sm text-gray-600">{dept.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}