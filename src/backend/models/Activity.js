const mongoose = require('mongoose');
const { getConnections } = require('../config/database');

const activitySchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    actorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'GROUP_CREATED',
        'MEMBER_ADDED',
        'EXPENSE_CREATED',
        'PAYMENT_SETTLED',
        'GROUP_DELETED',
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

activitySchema.index({ groupId: 1, createdAt: -1 });

const groupConnection = getConnections('group');
const Activity =
  groupConnection.models.Activity || groupConnection.model('Activity', activitySchema);

module.exports = Activity;
