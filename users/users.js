const users = [];
// store new user
const storeUser = ({ user, id, room }) => {
  users.push({ user, id, room });
};

// User leaves chat
function userLeave(id) {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

function getCurrentUser(id) {
  return users.find((user) => user.id === id);
}

// Get room users
function getRoomUsers(room) {
  return users.filter((user) => user.room === room);
}

module.exports = { storeUser, userLeave, getRoomUsers, getCurrentUser };
