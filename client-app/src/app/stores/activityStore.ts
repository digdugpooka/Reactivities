import { observable, action, computed, configure, runInAction } from 'mobx';
import { createContext, SyntheticEvent } from 'react';
import { IActivity } from '../models/activity';
import Agent from '../api/Agent';

configure({ enforceActions: 'always'});

class ActivityStore {
    @observable activityRegistry = new Map(); // MobX Observable Map
    
    @observable loadingInitial = false;
    @observable activity: IActivity | null = null;
    @observable submitting = false;
    @observable target = ''; // target element for showing indicator

    @computed get activitiesByDate() { 
        // return Array.from(this.activityRegistry.values()).sort(
        //     (a, b) => Date.parse(a.date) - Date.parse(b.date)
        // );
        return this.groupActivitiesByDate(Array.from(this.activityRegistry.values()));
    }

    groupActivitiesByDate(activities: IActivity[]) {
        const sortedActivities = activities.sort(
            (a, b) => Date.parse(a.date) - Date.parse(b.date)
        );
        return Object.entries(sortedActivities.reduce((activities, activity) => { 
            const date = activity.date.split('T')[0];
            activities[date] = activities[date] ? [...activities[date], activity] : [activity];
            return activities;
        }, {} as {[key: string]: IActivity[]}));
    }

    @action clearActivity = () => { 
        this.activity = null;
    }

    @action createActivity = async (activity: IActivity) => { 
        this.submitting = true;
        try {
            await Agent.Activities.create(activity);
            runInAction('creating activity', () => {
                this.activityRegistry.set(activity.id, activity);
            });
        }
        catch (error) { 
            console.log(error);
        }
        finally { 
            runInAction('reset submitting', () => { 
                this.submitting = false;
            });
        }
    }

    @action deleteActivity = async (event: SyntheticEvent<HTMLButtonElement>, id: string) => { 
        this.submitting = true;
        this.target = event.currentTarget.name;
        try { 
            await Agent.Activities.delete(id);
            runInAction(() => { 
                this.activityRegistry.delete(id);
            });
        } catch (error) { 
            console.log(error);
        }
        finally { 
            runInAction(() => { 
                this.submitting = false;
                this.target = '';
            });
        }
    }

    @action editActivity = async (activity: IActivity) => { 
        this.submitting = true;
        try { 
            await Agent.Activities.update(activity);
            runInAction(() => { 
                this.activityRegistry.set(activity.id, activity);
                this.activity = activity;
            });
        } 
        catch (error) { 
            console.log(error);
        }
        finally {
            runInAction(() => { 
                this.submitting = false;
            });
        }
    }

    // Darren: async/await used below rather than standard promise-based then() chains.
    // Neither approach is "wrong" but async/await is arguably cleaner since it expands downward instead of rightward.
    @action loadActivities = async () => { 
        this.loadingInitial = true;
        try {
            const activities = await Agent.Activities.list();
            runInAction('loading activities', () => { 
                activities.forEach(activity => {
                    activity.date = activity.date.split('.')[0];
                    this.activityRegistry.set(activity.id, activity);
                });
            });
            console.log(this.groupActivitiesByDate(activities));
        }
        catch(error) {
            console.log(error);
        }
        finally {
            runInAction('reset loading initial', () => { 
                this.loadingInitial = false;
            });
        }
    }

    // Gets an activity from the local map/registry if it exists, otherwise the API.
    @action loadActivity = async (id: string) => { 
        let activity = this.getActivity(id);
        if (activity) {
            this.activity = activity;
        } else { 
            this.loadingInitial = true;
            try { 
                activity = await Agent.Activities.details(id);
                runInAction('getting activity', () => { 
                    this.activity = activity;
                });
            } 
            catch (error) { 
                console.log(error);
            } 
            finally { 
                runInAction(() => { 
                    this.loadingInitial = false;
                });
            }
        }
        
    }

    getActivity = (id: string) => { 
        return this.activityRegistry.get(id);
    }
}

// Exposes ActivityStore in React Context so it can be accessed via the useContext hook.
export default createContext(new ActivityStore())