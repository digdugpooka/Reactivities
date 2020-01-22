import React, { useState, useEffect, Fragment, SyntheticEvent } from 'react';
import { Container } from 'semantic-ui-react'
import { IActivity } from '../models/activity';
import { NavBar } from '../../features/nav/navbar';
import { ActivityDashboard } from '../../features/activities/dashboard/ActivityDashboard';
import Agent from '../api/Agent';
import { LoadingComponent } from './LoadingComponent';

const App = () => {

  const [activities, setActivities] = useState<IActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<IActivity | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [target, setTarget] = useState('');

  const handleSelectActivity = (id: string) => { 
    setSelectedActivity(activities.filter(a => a.id === id)[0]);
    setEditMode(false);
  };

  const handleOpenCreateForm = () => {
    setSelectedActivity(null);
    setEditMode(true);
  };

  const handleCreateActivity = (activity: IActivity) => { 
    setSubmitting(true);
    Agent.Activities.create(activity).then(() => {
      setActivities([...activities, activity]);
      setSelectedActivity(activity);
      setEditMode(false);
    })
    .then(() => setSubmitting(false));
  };

  const handleEditActivity = (activity: IActivity) => { 
    setSubmitting(true);
    Agent.Activities.update(activity).then(() => {
      setActivities([...activities.filter(a => a.id !== activity.id), activity]);
      setSelectedActivity(activity);
      setEditMode(false);
    })
    .then(() => setSubmitting(false));
  };

  const handleDeleteActivity = (event: SyntheticEvent<HTMLButtonElement>, id: string) => { 
    setSubmitting(true);
    setTarget(event.currentTarget.name);
    Agent.Activities.delete(id).then(() => { 
      setActivities([...activities.filter(a => a.id !== id)]);
    })
    .then(() => setSubmitting(false));
  };

  useEffect(() => {
    Agent.Activities
      .list()
      .then((response) => {
        let activities: IActivity[] = [];
        response.forEach(activity => {
          activity.date = activity.date.split('.')[0];
          activities.push(activity);
        });
        setActivities(activities);
      })
      .then(() => setLoading(false));
  }, []); // second parameter (empty array) prevents this effect from running on every re-render

  if (loading) return <LoadingComponent content='Loading activities...' />

  // NOTE: <Fragment> is just a way to have a single root element in JSX without emitting a plain <div> in the HTML.
  return (
    <Fragment>
      <NavBar openCreateForm={handleOpenCreateForm} />
      <Container style={{marginTop: '7em'}}>
        <ActivityDashboard 
          activities={activities} 
          selectActivity={handleSelectActivity} 
          selectedActivity={selectedActivity} 
          editMode={editMode}
          setEditMode={setEditMode}
          setSelectedActivity={setSelectedActivity}
          createActivity={handleCreateActivity}
          editActivity={handleEditActivity}
          deleteActivity={handleDeleteActivity}
          submitting={submitting}
          target={target}
          />
      </Container>
    </Fragment>
  );

}

export default App;
