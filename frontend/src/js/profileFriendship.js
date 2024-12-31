const requestFriendship = async (id) => {
  try {
    const response = await fetch(
      `/api/players/${
        window.state.loggedInUsers[window.currentUserID].id
      }/friends/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendUserId: id }),
      }
    );
    if (!response.ok) alert("Failed to send request");
  } catch (error) {
    alert(error);
    return;
  }
  await updateToProfile(window.currentUserID);
};

const approveFriendship = async (id) => {
  try {
    const response = await fetch(
      `/api/players/${
        window.state.loggedInUsers[window.currentUserID].id
      }/friends/manage/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendUserId: id, action: "approve" }),
      }
    );
    if (!response.ok) alert("Failed to approve");
  } catch (error) {
    alert(error);
    return;
  }
  await updateToProfile(window.currentUserID);
};

const denyFriendship = async (id) => {
  try {
    const response = await fetch(
      `/api/players/${
        window.state.loggedInUsers[window.currentUserID].id
      }/friends/manage/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendUserId: id, action: "approve" }),
      }
    );
    if (!response.ok) alert("Failed to deny");
  } catch (error) {
    alert(error);
    return;
  }
  await updateToProfile(window.currentUserID);
};
