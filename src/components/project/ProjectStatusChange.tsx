@@ .. @@
 import React, { useState } from 'react';
 import { AlertCircle, Flag, CheckCircle, MessageSquare } from 'lucide-react';
+import toast from 'react-hot-toast';
 import type { ProjectStatus } from '../../types/project';
 
@@ .. @@
   const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     onStatusChange(selectedStatus, notes);
+    toast.success('Project status updated successfully');
     setIsOpen(false);
     setNotes('');
   };