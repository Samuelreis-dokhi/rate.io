const express = require('express');
const router = express.Router();

const {
  createGroup,
  addMember,
  inviteMember,
  getUserGroups,
  getGroupActivities,
  deleteGroup,
} = require('../controllers/groupController');

router.post('/', createGroup);
router.post('/:groupId/members', addMember);
router.post('/:groupId/invite', inviteMember);
router.post('/:groupId', deleteGroup);
router.post('/:groupId/delete', deleteGroup);
router.post('/delete/:groupId', deleteGroup);
router.get('/user/:userId', getUserGroups);
router.get('/:groupId/activities', getGroupActivities);
router.delete('/:groupId', deleteGroup);
router.delete('/:groupId/delete', deleteGroup);
router.delete('/delete/:groupId', deleteGroup);

module.exports = router;
