import React, { useContext, useState } from "react";
import { observer } from "mobx-react-lite";
import { RootStoreContext } from "../../app/stores/rootStore";
import { Tab, Form, Button, Grid, Header } from "semantic-ui-react";
import { Form as FinalForm, Field } from "react-final-form";
import TextInput from "../../app/common/form/TextInput";
import TextAreaInput from "../../app/common/form/TextAreaInput";
import { IProfile } from "../../app/models/profile";

const ProfileAbout = () => {
  const rootStore = useContext(RootStoreContext);
  const {
    updateProfile,
    profile,
    loadingProfile,
    isCurrentUser
  } = rootStore.profileStore;

  const [editMode, setEditMode] = useState(false);

  const handleFinalFormSubmit = (profile: IProfile | null) => {
    updateProfile(profile!);
  };

  return (
    <Tab.Pane>
      <Grid>
        <Grid.Column width={16} style={{ paddingBottom: 0 }}>
          <Header
            floated="left"
            icon="image"
            content={`About ${profile!.displayName}`}
          ></Header>
          {isCurrentUser && (
            <Button
              floated="right"
              basic
              content={editMode ? "Cancel" : "Edit Profile"}
              onClick={() => setEditMode(!editMode)}
            ></Button>
          )}
        </Grid.Column>
        <Grid.Column width={16}>
          {!editMode ? (
            <div>{profile!.bio}</div>
          ) : (
            <FinalForm
              initialValues={profile}
              onSubmit={handleFinalFormSubmit}
              render={({ handleSubmit, invalid, pristine }) => (
                <Form>
                  <Field
                    name="displayName"
                    value={profile!.displayName}
                    placeholder="Display Name"
                    component={TextInput}
                  />
                  <Field
                    name="bio"
                    value={profile!.bio}
                    placeholder="Bio"
                    component={TextAreaInput}
                  />
                  <Button
                    loading={loadingProfile}
                    disabled={loadingProfile || invalid || pristine}
                    floated="right"
                    positive
                    type="submit"
                    content="Submit"
                    onClick={handleSubmit}
                  />
                </Form>
              )}
            />
          )}
        </Grid.Column>
      </Grid>
    </Tab.Pane>
  );
};

export default observer(ProfileAbout);
