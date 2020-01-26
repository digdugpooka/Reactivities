import { observable, action, computed, configure, runInAction } from 'mobx';
import { createContext, SyntheticEvent } from 'react';
import { IActivity } from '../models/activity';
import Agent from '../api/Agent';

configure({ enforceActions: 'always'});

class ActivityStore {
    @observable activityRegistry = new Map(); // MobX Observable Map
    
    @observable activities: IActivity[] = [];
    @observable loadingInitial = false;
    @observable selectedActivity: IActivity | undefined;
    @observable editMode = false;
    @observable submitting = false;
    @observable target = ''; // target element for showing indicator

    @computed get activitiesByDate() { 
        return Array.from(this.activityRegistry.values()).sort(
            (a, b) => Date.parse(a.date) - Date.parse(b.date)
        );
    }

    @action cancelFormOpen = () => { 
        this.editMode = false;
    }

    @action cancelSelectedActivity = () => { 
        this.selectedActivity = undefined;
    }

    @action createActivity = async (activity: IActivity) => { 
        this.submitting = true;
        try {
            await Agent.Activities.create(activity);
            runInAction('creating activity', () => {
                this.activityRegistry.set(activity.id, activity);
                this.editMode = false;
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
                this.selectedActivity = activity;
                this.editMode = false;
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

    @action openCreateForm = () => { 
        this.editMode = true;
        this.selectedActivity = undefined;
    }

    @action openEditForm = (id: string) => { 
        this.selectedActivity = this.activityRegistry.get(id);
        this.editMode = true;
    }

    @action selectActivity = (id: string) => { 
        this.selectedActivity = this.activityRegistry.get(id); // this.activities.find(a => a.id === id);
        this.editMode = false;
    }

}

// Exposes ActivityStore in React Context so it can be accessed via the useContext hook.
export default createContext(new ActivityStore())