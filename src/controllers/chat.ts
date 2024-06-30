import { Socket } from "socket.io";
import {
  badRequestResponse,
  getResponse,
  internalServerResponse
} from "../utils/responses";
import { ControllerType } from "../utils/types";
import ChatChannelSchema from "../models/ChatChannelSchema";
import {
  createChannelDetails,
  createChatDetails,
  validateSentUserId,
  validateUser
} from "../utils/functions";
import { channel } from "diagnostics_channel";
import { allConnectedSocket } from "../app";
import {
  CHAT,
  ERROR,
  GET_MESSAGE,
  MARK_MESSAGE_READ,
  SEND_MESSAGE
} from "../utils/enums";
import MatchRequestSchema from "../models/MatchRequestScheme";
import ChatSchema from "../models/ChatSchema";
import { Types } from "mongoose";
import UserSchema from "../models/UserSchema";
import { imageRegExp } from "../utils/regex";

export const getChannelController: ControllerType = async (req, res) => {
  let response = {
    ...internalServerResponse
  };

  const user = await validateUser(req, res);

  if (user) {
    const receiver = await validateSentUserId(req, res);
    if (receiver) {
      const isMatch = await MatchRequestSchema.find({
        $and: [
          {
            $or: [
              {
                receiver_id: receiver._id,
                sender_id: user._id
              },
              {
                sender_id: receiver._id,
                receiver_id: user._id
              }
            ]
          },
          { is_accepted: true }
        ]
      });
      if (isMatch.length > 0) {
        const userIds = [user._id, receiver._id];
        const channel = await ChatChannelSchema.find({
          users: {
            $all: userIds.map((userId) => ({ $elemMatch: { user_id: userId } }))
          },
          is_grouped: false
        });

        if (channel.length < 1) {
          const channelDetails = await ChatChannelSchema.create({
            users: [
              {
                user_id: user._id
              },
              {
                user_id: receiver._id
              }
            ]
          });

          if (channelDetails) {
            const data = {
              channel: channelDetails._id,
              created_at: channelDetails.created_at
            };
            response = {
              ...getResponse,
              data
            };
          }
        }

        if (channel.length > 0) {
          const channelDetails = channel[0];
          const data = {
            channel: channelDetails._id,
            created_at: channelDetails.created_at
          };
          response = {
            ...getResponse,
            data
          };
        }
      } else {
        response = {
          ...badRequestResponse,
          message: "You can't sent message to this user"
        };
      }
    } else {
      return;
    }
  } else {
    return;
  }

  res.status(response.status).send(response);
};

export const emitMassMessage = (
  users: string[],
  func: (sockets: Socket[]) => void
) => {
  let userSocketOBJInArray: { [socketId: string]: Socket }[] = [];
  let allSocketList: Socket[] = [];

  users.forEach((userId) => {
    const userSocketOBJ = allConnectedSocket[userId];
    if (userSocketOBJ) {
      userSocketOBJInArray.push(userSocketOBJ);
    }
  });

  userSocketOBJInArray.forEach((data) => {
    Object.keys(data).forEach((key) => {
      allSocketList.push(data[key]);
    });
  });

  if (func && typeof func === "function") {
    func(allSocketList);
  }
  return;
};

export const sendChatList = async (userID: Types.ObjectId) => {
  if (userID) {
    try {
      const allChatList = await ChatChannelSchema.find({
        users: {
          $all: [{ $elemMatch: { user_id: userID } }]
        }
      });

      if (allChatList) {
        const channelChatPromise = Promise.all(
          allChatList.map(({ _id }) => ChatSchema.find({ channel: _id }))
        );
        const channelUsersPromise = Promise.all(
          allChatList.map(({ users }) =>
            Promise.all(
              users.map(({ user_id }) => UserSchema.findById(user_id))
            )
          )
        );

        const [channelChatList, channelUserList] = await Promise.all([
          channelChatPromise,
          channelUsersPromise
        ]);
        const data = allChatList
          .map(({ _id, is_grouped, group_name, users, created_at }, index) => {
            const channelUsers = channelUserList[index].filter(
              (user) =>
                user && JSON.stringify(user._id) !== JSON.stringify(userID)
            );

            const channelChat = channelChatList[index];
            const isUserStillInChat = users.find(
              (user) => JSON.stringify(user.user_id) && !user.left_at
            );
            const lastMessage = channelChat
              .filter(
                ({ users }) =>
                  !!users.find(
                    (user) =>
                      JSON.stringify(user.user_id) === JSON.stringify(userID) &&
                      !user.deleted_at
                  )
              )
              .sort(
                (chatA, chatB) =>
                  new Date(chatB.created_at).getTime() -
                  new Date(chatA.created_at).getTime()
              )[0];
            const possibleGroupChatName =
              channelUsers.length > 0
                ? `${channelUsers
                    .slice(0, 2)
                    .map((user) => (user ? user?.name : "Deleted account"))} ${
                    channelUsers.length > 2
                      ? `+${channelUsers.length - 2}more`
                      : ""
                  }`
                : "Deleted group";

            return {
              channel: _id,
              name: is_grouped
                ? group_name ?? possibleGroupChatName
                : channelUsers[0]?.name ?? "Deleted account",
              last_sent_message: lastMessage,
              un_read: channelChat.filter(
                ({ sender_id, users }) =>
                  JSON.stringify(sender_id) !== JSON.stringify(userID) &&
                  !!users.find(
                    (user) =>
                      JSON.stringify(user.user_id) === JSON.stringify(userID) &&
                      !user.seen_at
                  )
              ).length,
              last_time_updated: lastMessage?.created_at ?? created_at,
              can_send_message: !!isUserStillInChat
            };
          })
          .sort(
            (channelDetailsA, channelDetailsB) =>
              new Date(channelDetailsB?.last_time_updated).getTime() -
              new Date(channelDetailsA?.last_time_updated).getTime()
          );
        emitMassMessage([JSON.stringify(userID)], async (sockets) => {
          sockets.forEach((socket) => {
            socket.emit(userID.toString(), data);
          });
        });
        return;
      }
    } catch (error) {
      emitMassMessage([JSON.stringify(userID)], async (sockets) => {
        sockets.forEach((socket) => {
          socket.emit(ERROR, {
            message: "Error encountered when fetching chat list"
          });
          return;
        });
      });
    }
  }
};

export const sendChannelMessageList = async (
  channelID: Types.ObjectId,
  userId: Types.ObjectId
) => {
  if (channelID) {
    try {
      const channel = await ChatChannelSchema.findById(channelID);

      if (channel) {
        const users = channel?.users?.map(({ user_id }) =>
          JSON.stringify(user_id)
        );
        const userInChannel = channel?.users?.find(
          ({ user_id, left_at }) =>
            JSON.stringify(user_id) === JSON.stringify(userId) && !left_at
        );
        const messages = (await ChatSchema.find({ channel: channel._id }))
          .sort(
            (messageA, messageB) =>
              new Date(messageA.created_at).getTime() -
              new Date(messageB.created_at).getTime()
          )
          .map((chat) => createChatDetails(chat));

        emitMassMessage(users, (sockets) => {
          sockets.forEach((socket) => {
            socket.emit(`${channel._id}-${CHAT}`, {
              can_send_message: !!userInChannel,
              messages
            });
          });
        });
      }
      return;
    } catch (error) {}
  }
  return;
};
export const getMessageController = (socket: Socket & { user?: any }) => {
  socket.on(GET_MESSAGE, async ({ channel_id }) => {
    if (socket.user && channel_id) {
      sendChannelMessageList(channel_id, socket.user?._id);
    }
  });
};
export const markMessageReadController = (socket: Socket & { user?: any }) => {
  socket.on(MARK_MESSAGE_READ, async ({ channel_id, message_ids }) => {
    if (socket.user && channel_id) {
      const userID = socket?.user?._id;
      if (message_ids && Array.isArray(message_ids) && message_ids.length > 0) {
        const availableMessages = await Promise.all(
          message_ids.map((id) => ChatSchema.findById(id))
        );
        const _ = await Promise.all(
          availableMessages
            .filter((message) => !!message)
            .map((message) => {
              return ChatSchema.findByIdAndUpdate(message?._id, {
                users: message?.users?.map((user) =>
                  JSON.stringify(user.user_id) === JSON.stringify(userID)
                    ? {
                        ...user,
                        seen_at: new Date()
                      }
                    : user
                )
              });
            })
        );
        sendChannelMessageList(channel_id, socket.user?._id);
      }
    }
  });
};

export const sendMessageController = (socket: Socket & { user?: any }) => {
  socket.on(
    SEND_MESSAGE,
    async ({
      channel_id,
      message,
      files = []
    }: {
      channel_id: Types.ObjectId;
      message: string;
      files: string[];
    }) => {
      if (socket.user && channel_id) {
        try {
          const userId = socket?.user?._id;
          const channel = await ChatChannelSchema.findById(channel_id);

          if (channel) {
            const userInChannel = channel?.users?.find(
              ({ user_id, left_at }) =>
                JSON.stringify(user_id) === JSON.stringify(userId) && !left_at
            );

            if (userInChannel) {
              const users = channel?.users?.map(({ user_id }) =>
                JSON.stringify(user_id)
              );
              const channelUsers = channel?.users;
              const chatUsers = channel?.users?.map(({ user_id }) => ({
                user_id,
                seen_at:
                  JSON.stringify(user_id) === JSON.stringify(userId)
                    ? new Date()
                    : null
              }));
              const chatMessage = {
                channel: channel_id,
                users: chatUsers,
                message,
                files: files.filter((file) => file && imageRegExp.test(file)),
                sender_id: userId
              };
              const chatDetails = await ChatSchema.create(chatMessage);
              emitMassMessage(users, (sockets) => {
                sockets.forEach((socket) => {
                  console.log(socket.id);
                  socket.emit(
                    channel_id.toString(),
                    createChatDetails(chatDetails)
                  );
                });
              });
              sendChannelMessageList(channel_id, userId);
              channelUsers.forEach((user) => {
                sendChatList(user.user_id);
              });
              return;
            }

            if (!userInChannel) {
              socket.emit(ERROR, {
                message: "You are not a participant of this chat"
              });
              return;
            }
          }

          if (!channel) {
            socket.emit(ERROR, { message: "Channel not found" });
            return;
          }
        } catch (error) {
          socket.emit(ERROR, { message: "Unknown error occured" });
          return;
        }
      } else {
        socket.disconnect();
        return;
      }
    }
  );
};
