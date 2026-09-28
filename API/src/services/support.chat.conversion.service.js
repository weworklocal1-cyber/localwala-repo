/**
 * LocalWala – Local Commerce & Delivery Platform
 * (NodeJS, MongoDB, Angular & Flutter)
 *
 * Copyright © 2026 WeWorkLocal Private Limited
 * https://weworklocal.in/
 *
 * WeWorkLocal Private Limited
 *
 * This source code is confidential.
 * Unauthorized copying, redistribution, resale, publication,
 * modification, or use of this source code in any public or
 * commercial repository is strictly prohibited.
 *
 * Ownership Fingerprint:
 * LWL|WWL|2026|LOCALWALA|NODE
 */

const mongoose = require('mongoose');
const { SupportChatConversion, SupportChatRoom } = require('../models');

const getMessages = async (roomID, options) => {
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const skip = (page - 1) * limit;
  const conversionQuery = [
    { $match: { roomId: new mongoose.Types.ObjectId(roomID) } },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: Number(limit) },
    {
      $lookup: {
        from: 'users',
        localField: 'senderId',
        foreignField: '_id',
        as: 'users',
      },
    },
    {
      $unwind: {
        path: '$users',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        roomId: 1,
        senderId: 1,
        message: 1,
        messageType: 1,
        createdAt: 1,
        sender: {
          id: { $ifNull: ['$users._id', ''] },
          image: { $ifNull: ['$users.image', ''] },
          firstName: { $ifNull: ['$users.firstName', ''] },
          lastName: { $ifNull: ['$users.lastName', ''] },
          role: { $ifNull: ['$users.role', ''] },
        },
      },
    },
  ];
  const chats = await SupportChatConversion.aggregate(conversionQuery);
  const totalResults = await SupportChatConversion.countDocuments({
    roomId: new mongoose.Types.ObjectId(roomID),
  });
  return Promise.all([chats, totalResults]).then(() => {
    const totalPages = Math.ceil(totalResults / limit);
    const result = {
      roomID,
      chats,
      page,
      limit,
      totalPages,
      totalResults,
      success: true,
    };
    return Promise.resolve(result);
  });
};

const saveNewMessage = async (room, sender, msg, msgType) => {
  const msgData = new SupportChatConversion({
    roomId: room,
    senderId: sender,
    message: msg,
    messageType: msgType,
  });
  await SupportChatConversion.create(msgData);
  const chatRoomData = await SupportChatRoom.findById(room);
  if (chatRoomData && chatRoomData !== null) {
    const updateBody = {
      lastMessage: msg,
      lastMessageType: msgType,
    };
    Object.assign(chatRoomData, updateBody);
    await chatRoomData.save();
  }
  return { success: true };
};

const saveSupportMessage = async (room, sender, msg, msgType) => {
  const msgData = new SupportChatConversion({
    roomId: room,
    senderId: sender,
    message: msg,
    messageType: msgType,
  });
  await SupportChatConversion.create(msgData);
  const chatRoomData = await SupportChatRoom.findById(room);
  if (chatRoomData && chatRoomData !== null) {
    const updateBody = {
      lastMessage: msg,
      lastMessageType: msgType,
      status: 'in_progress',
    };
    Object.assign(chatRoomData, updateBody);
    await chatRoomData.save();
  }
  await SupportChatRoom.findByIdAndUpdate(
    room,
    { $addToSet: { supportTeam: sender } },
    { new: true }
  );
  return { success: true };
};

const adminChatMessages = async (roomId, options) => {
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const skip = (page - 1) * limit;
  const conversionQuery = [
    { $match: { roomId: new mongoose.Types.ObjectId(roomId) } },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: Number(limit) },
    {
      $lookup: {
        from: 'users',
        localField: 'senderId',
        foreignField: '_id',
        as: 'users',
      },
    },
    {
      $unwind: {
        path: '$users',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        roomId: 1,
        senderId: 1,
        message: 1,
        messageType: 1,
        createdAt: 1,
        sender: {
          id: { $ifNull: ['$users._id', ''] },
          image: { $ifNull: ['$users.image', ''] },
          firstName: { $ifNull: ['$users.firstName', ''] },
          lastName: { $ifNull: ['$users.lastName', ''] },
          role: { $ifNull: ['$users.role', ''] },
        },
      },
    },
  ];
  const chats = await SupportChatConversion.aggregate(conversionQuery);
  const totalResults = await SupportChatConversion.countDocuments({
    roomId: new mongoose.Types.ObjectId(roomId),
  });
  return Promise.all([chats, totalResults]).then(() => {
    const totalPages = Math.ceil(totalResults / limit);
    const result = {
      roomId,
      chats,
      page,
      limit,
      totalPages,
      totalResults,
      success: true,
    };
    return Promise.resolve(result);
  });
};

const cityzenChatMessages = async (roomId, options) => {
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const skip = (page - 1) * limit;
  const conversionQuery = [
    { $match: { roomId: new mongoose.Types.ObjectId(roomId) } },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: Number(limit) },
    {
      $lookup: {
        from: 'users',
        localField: 'senderId',
        foreignField: '_id',
        as: 'users',
      },
    },
    {
      $unwind: {
        path: '$users',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        roomId: 1,
        senderId: 1,
        message: 1,
        messageType: 1,
        createdAt: 1,
        sender: {
          id: { $ifNull: ['$users._id', ''] },
          image: { $ifNull: ['$users.image', ''] },
          firstName: { $ifNull: ['$users.firstName', ''] },
          lastName: { $ifNull: ['$users.lastName', ''] },
          role: { $ifNull: ['$users.role', ''] },
        },
      },
    },
  ];
  const chats = await SupportChatConversion.aggregate(conversionQuery);
  const totalResults = await SupportChatConversion.countDocuments({
    roomId: new mongoose.Types.ObjectId(roomId),
  });
  return Promise.all([chats, totalResults]).then(() => {
    const totalPages = Math.ceil(totalResults / limit);
    const result = {
      roomId,
      chats,
      page,
      limit,
      totalPages,
      totalResults,
      success: true,
    };
    return Promise.resolve(result);
  });
};

const exportCollection = async () => {
  const query = [
    {
      $lookup: {
        from: 'users',
        localField: 'senderId',
        foreignField: '_id',
        as: 'users',
      },
    },
    {
      $unwind: {
        path: '$users',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        roomId: 1,
        senderId: 1,
        message: 1,
        messageType: 1,
        createdAt: 1,
        sender: {
          id: { $ifNull: ['$users._id', ''] },
          firstName: { $ifNull: ['$users.firstName', ''] },
          lastName: { $ifNull: ['$users.lastName', ''] },
          role: { $ifNull: ['$users.role', ''] },
        },
      },
    },
  ];
  const results = await SupportChatConversion.aggregate(query);
  return results;
};

const exportRawCollection = async () => {
  const results = await SupportChatConversion.find();
  return results;
};

module.exports = {
  getMessages,
  saveNewMessage,
  saveSupportMessage,
  adminChatMessages,
  cityzenChatMessages,
  exportCollection,
  exportRawCollection,
};

