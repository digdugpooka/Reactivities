import React, { useEffect, Fragment, useContext } from 'react';
import { Container } from 'semantic-ui-react'
import NavBar from '../../features/nav/navbar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import { LoadingComponent } from './LoadingComponent';
import ActivityStore from '../stores/activityStore';
import { observer } from 'mobx-react-lite';

const App = () => {

  const activityStore = useContext(ActivityStore)

  useEffect(() => {
      activityStore.loadActivities();
    }, 
    [activityStore] // external dependencies should be included here when useEffect depends on something
  ); // second parameter (empty array) prevents this effect from running on every re-render

  if (activityStore.loadingInitial) return <LoadingComponent content='Loading activities...' />

  // NOTE: <Fragment> is just a way to have a single root element in JSX without emitting a plain <div> in the HTML.
  return (
    <Fragment>
      <NavBar />
      <Container style={{marginTop: '7em'}}>
        <ActivityDashboard />
      </Container>
    </Fragment>
  );

}

export default observer(App);
