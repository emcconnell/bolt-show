import { useState, useEffect } from 'react';
import type { ProjectFormData } from '../types/project';

interface ValidationErrors {
  title?: string;
  description?: string;
  shortDescription?: string;
  media?: string;
  tags?: string;
  techStack?: string;
  links?: string;
}

interface ValidationState {
  errors: ValidationErrors;
  isValid: boolean;
  isDirty: boolean;
}

export function useProjectFormValidation(formData: ProjectFormData) {
  const [validation, setValidation] = useState<ValidationState>({
    errors: {},
    isValid: false,
    isDirty: false
  });

  const validateField = (field: keyof ProjectFormData, value: any): string | undefined => {
    switch (field) {
      case 'title':
        if (!value?.trim()) return 'Title is required';
        if (value.length < 5) return 'Title must be at least 5 characters';
        if (value.length > 100) return 'Title must be less than 100 characters';
        break;
      
      case 'description':
        if (!value?.trim()) return 'Description is required';
        if (value.length < 50) return 'Description must be at least 50 characters';
        if (value.length > 5000) return 'Description must be less than 5000 characters';
        break;
      
      case 'shortDescription':
        if (!value?.trim()) return 'Short description is required';
        if (value.length < 10) return 'Short description must be at least 10 characters';
        if (value.length > 150) return 'Short description must be less than 150 characters';
        break;
      
      case 'media':
        if (!value?.length) return 'At least one image or video is required';
        break;
      
      case 'tags':
        if (!value?.length) return 'At least one tag is required';
        if (value.length > 3) return 'Maximum 3 tags allowed';
        break;
      
      case 'techStack':
        if (!value?.length) return 'At least one technology is required';
        break;
      
      case 'links':
        if (value?.length) {
          const hasInvalidUrl = value.some((link: any) => {
            try {
              new URL(link.url);
              return false;
            } catch {
              return true;
            }
          });
          if (hasInvalidUrl) return 'All links must be valid URLs';
        }
        break;
    }
  };

  const validateForm = (data: ProjectFormData): ValidationErrors => {
    const errors: ValidationErrors = {};
    
    (Object.keys(data) as Array<keyof ProjectFormData>).forEach(field => {
      const error = validateField(field, data[field]);
      if (error) errors[field] = error;
    });

    return errors;
  };

  useEffect(() => {
    const errors = validateForm(formData);
    const isValid = Object.keys(errors).length === 0;
    
    setValidation(prev => ({
      errors,
      isValid,
      isDirty: prev.isDirty
    }));
  }, [formData]);

  const setFieldTouched = (field: keyof ProjectFormData) => {
    setValidation(prev => ({
      ...prev,
      isDirty: true
    }));
  };

  return {
    errors: validation.errors,
    isValid: validation.isValid,
    isDirty: validation.isDirty,
    setFieldTouched,
    validateField
  };
}