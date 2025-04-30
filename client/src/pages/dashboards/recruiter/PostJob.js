import React, { useState } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import axios from 'axios';

const PostJob = () => {
  const [jobData, setJobData] = useState({
    title: '',
    company: '',
    description: '',
    requirements: '',
    location: '',
    salary: '',
    customFields: []
  });

  const [newField, setNewField] = useState({
    fieldName: '',
    fieldType: 'text',
    required: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJobData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCustomField = () => {
    if (newField.fieldName.trim()) {
      setJobData(prev => ({
        ...prev,
        customFields: [...prev.customFields, { ...newField }]
      }));
      setNewField({
        fieldName: '',
        fieldType: 'text',
        required: false
      });
    }
  };

  const handleRemoveCustomField = (index) => {
    setJobData(prev => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/jobs', jobData);
      alert('Job posted successfully!');
    } catch (error) {
      console.error('Error posting job:', error);
      alert('Error posting job');
    }
  };

  return (
    <Container className="mt-4">
      <Card>
        <Card.Body>
          <h2>Post a New Job</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Job Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={jobData.title}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Company</Form.Label>
              <Form.Control
                type="text"
                name="company"
                value={jobData.company}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={jobData.description}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Requirements</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="requirements"
                value={jobData.requirements}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={jobData.location}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Salary</Form.Label>
              <Form.Control
                type="text"
                name="salary"
                value={jobData.salary}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Card className="mb-3">
              <Card.Body>
                <h4>Custom Fields</h4>
                {jobData.customFields.map((field, index) => (
                  <div key={index} className="mb-2 d-flex align-items-center">
                    <div className="flex-grow-1">
                      <strong>{field.fieldName}</strong> ({field.fieldType})
                      {field.required ? ' - Required' : ' - Optional'}
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveCustomField(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}

                <Form.Group className="mb-2">
                  <Form.Label>Field Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={newField.fieldName}
                    onChange={(e) => setNewField(prev => ({
                      ...prev,
                      fieldName: e.target.value
                    }))}
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Field Type</Form.Label>
                  <Form.Select
                    value={newField.fieldType}
                    onChange={(e) => setNewField(prev => ({
                      ...prev,
                      fieldType: e.target.value
                    }))}
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="file">File</option>
                  </Form.Select>
                </Form.Group>

                <Form.Check
                  type="checkbox"
                  label="Required"
                  checked={newField.required}
                  onChange={(e) => setNewField(prev => ({
                    ...prev,
                    required: e.target.checked
                  }))}
                  className="mb-2"
                />

                <Button variant="secondary" onClick={handleAddCustomField}>
                  Add Custom Field
                </Button>
              </Card.Body>
            </Card>

            <Button variant="primary" type="submit">
              Post Job
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PostJob; 