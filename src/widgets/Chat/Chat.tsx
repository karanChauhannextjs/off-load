import React, { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import cn from 'classnames';
import AC, { AgoraChat } from 'agora-chat';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import styles from './Chat.module.scss';
import {
  ChatProps,
  clientChatTabs,
  clientsTabs,
  IConversation,
  inboxTabs, signoutTabs,
} from '@widgets/Chat/Chat.types.ts';
import {
  areMessagesOnSameDay,
  checkUrlAfterProtocol,
  dateFormatter2,
  extractUsername,
  getFileType,
  getInitialsLetters,
  getTypeCall,
  truncateFileName,
} from '@utils/helpers.ts';
import { IScheduleCard } from '@models/book.ts';
import {
  Avatar,
  Button,
  Input,
  ScheduleCard,
  ShareController,
} from '@shared/ui';
import connection from '../../services/agoraChat.ts';
import { useConversation } from '@store/chat.ts';
import ImageWithLoader from '@features/ImageWithLoader/ImageWithLoader.tsx';
import FileLogo from '@assets/svg/fileLogo.svg';
import PdfLogo from '@assets/svg/pdfLogo.svg';
import { DeleteMessagePopup } from '@features/DeleteMessagePopup/DeleteMessagePopup.tsx';
import {
  AppModal,
  useAppModalSimpleHandlers,
} from '@shared/ui/AppModal/AppModal.tsx';
import {
  AddClientCard,
  AddThisClientModal,
  ExerciseCard,
  MessageDeleteModal,
  NotesClients,
} from '@features/index.ts';
import toast from 'react-hot-toast';
import { Feed, LoadingScreen } from '@pages/index.ts';
import { useUnreadStore } from '@store/unreadStore.ts';
import { useExercises } from '@store/exercises.ts';
import { USER_TYPES } from '@constants/user.ts';
import {
  EXERCISE_PUBLIC_BASE_URL, RoutesEnum, USER_PUBLIC_BASE_URL,
  VIEW_PUBLIC_BASE_URL,
} from '@routes/Routes.types.ts';
import { useExerciseComplete } from '@store/exerciseComplete.ts';
import { useNote } from '@store/note.ts';
import Therapists from '@assets/images/therapists.png';
import BlackStar from '@assets/svg/blackStar.svg';
import {
  ALICE_DEMO_MESSAGES,
  ALICE_EMAIL,
  JONAH_DEMO_MESSAGES,
  JONAH_EMAIL,
} from '@constants/chat.ts';
import CreateMsgType = AgoraChat.CreateMsgType;
import { useProfileStore } from '@store/profile.ts';
import { PaidStatus } from '@constants/plans.ts';

const Chat: React.FC<ChatProps> = (props) => {
  let {
    conversations,
    user,
    page,
    bookingsData,
    isMobileScreen,
    onAddClick,
    onConnectClick,
    onClickCard,
  } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const modalHandlers = useAppModalSimpleHandlers();
  const chatRef = useRef<HTMLDivElement>(null);
  const listsRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const getConversations = useConversation((state) => state.getConversations);
  const getConversationsStatus = useConversation(
    (state) => state.getConversationsStatus,
  );
  const createConversation = useConversation(
    (state) => state.createConversation,
  );
  const updateConversation = useConversation(
    (state) => state.updateConversation,
  );
  const getAgoraRefreshToken = useConversation(
    (state) => state.getAgoraRefreshToken,
  );
  const removeConversation = useConversation(
    (state) => state.removeConversation,
  );
  const removeClientsConversation = useConversation(
    (state) => state.removeClientsConversation,
  );
  const setNewMessagesState = useUnreadStore(
    (state: any) => state.setNewMessagesState,
  );
  const setNewMessagesClientsState = useUnreadStore(
    (state: any) => state.setNewMessagesClientsState,
  );

  const [scheduleData, setScheduleData] = useState<IScheduleCard[] | undefined>(
    [],
  );
  const [isActiveTab, setIsActiveTab] = useState<string>(((user?.type === USER_TYPES.THERAPIST && location.pathname.includes('shared-clients')) || !user?.uuid) ? 'Feed' : 'Messages');
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);
  const [conversationsList, setConversationsList] = useState<any[]>([]);
  const [listPageNum, setListPageNum] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [isFetched, setIsFetched] = useState<boolean>(false);
  // const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isFirstFetch, setIsFirstFetch] = useState<boolean>(true);
  const [isSecondFetch, setIsSecondFetch] = useState<boolean>(false);
  const [newMessage, setNewMessage] = useState<boolean>(false);
  const exerciseUsers = useExerciseComplete(
    (state: any) => state.exerciseUsers,
  );
  const [isActiveChat, setIsActiveChat] = useState(
    isMobileScreen || exerciseUsers ? null : conversations?.[0],
  );
  const [file, setFile] = useState<File | undefined>(undefined);
  const [fileUploaded, setFileUploaded] = useState<boolean>(false);
  const [fileThumbnail, setFileThumbnail] = useState<any>(undefined);
  const [newConversations, setNewConversations] =
    useState<IConversation[]>(conversations);
  const [isNewChat, setIsNewChat] = useState(false);
  const [failFetch, setFailFetch] = useState<boolean>(false);
  const name =
    user?.type === USER_TYPES.THERAPIST
      ? isActiveChat?.client?.name
      : isActiveChat?.therapist?.name;
  const agoraUsername =
    user?.type === USER_TYPES.THERAPIST
      ? isActiveChat?.client?.agoraUsername
      : isActiveChat?.therapist?.agoraUsername;
  const [messageMenu, setMessageMenu] = useState<any>(null);
  const [messageMenuOther, setMessageMenuOther] = useState<any>(null);
  const [messageMenuChat, setMessageMenuChat] = useState<any>(null);
  const [messageDelete, setMessageDelete] = useState(false);
  const [addThisClientShow, setAddThisClientShow] = useState(false);
  const searchParam = searchParams.get('chatId');
  const tabsData = page === 'inbox' ? inboxTabs : user?.uuid ?  clientsTabs : signoutTabs;
  const getClientJoinedExercises = useExercises(
    (state) => state.getClientJoinedExercises,
  );
  const joinedClientExercises = useExercises(
    (state) => state.joinedClientExercises,
  );
  const getTherapistJoinedExercises = useExercises(
    (state) => state.getTherapistJoinedExercises,
  );
  const getTherapistJoinedExercisesStatus = useExercises(
    (state) => state.getTherapistJoinedExercisesStatus,
  );
  const joinedTherapistExercises = useExercises(
    (state) => state.joinedTherapistExercises,
  );
  const unJoinExercise = useExercises((state) => state.unJoinExercise);
  const joinExerciseStatus = useExercises((state) => state.joinExerciseStatus);
  const unJoinExerciseStatus = useExercises(
    (state) => state.unJoinExerciseStatus,
  );
  const favoriteExercise = useExercises((state) => state.favoriteExercise);
  const unFavoriteExercise = useExercises((state) => state.unFavoriteExercise);
  const viewExercise = useExercises((state) => state.viewExercise);
  const setExerciseUsersData = useExerciseComplete(
    (state: any) => state.setExerciseUsersData,
  );
  const resetExercises = useExerciseComplete((state: any) => state.reset);
  const resetExercisesData = useExercises((state: any) => state.reset);
  const resetNote = useNote((state: any) => state.reset);

  const [isOpen, setIsOpen] = useState(false);
  const dotsRef = useRef(null);
  const [isFeedData, setIsFeedData] = useState<boolean>(true);
  const [agoraUsernames, setAgoraUsernames] = useState<string[]>([]);
  const [switchs, setSwitchs] = useState<any>({});
  const currentUser = useProfileStore((state) => state.currentUser);

  const fetchOldMessages = async (targetId: string) => {
    setLoading(true);
    try {
      const options: {
        chatType: 'singleChat' | 'groupChat' | 'chatRoom';
        targetId: string;
        pageSize: number;
        searchDirection: 'down' | 'up';
        cursor: any;
      } = {
        searchDirection: 'up',
        chatType: 'singleChat',
        targetId: targetId,
        pageSize: 300,
        cursor: messages.length > 0 ? messages[0]?.id : undefined,
      };
      if (!!isActiveChat) {
        const historyMessages = await connection.getHistoryMessages(options);
        if (messages.length) {
          setMessages((prevMessages) => [
            ...historyMessages.messages.reverse(),
            ...prevMessages,
          ]);
        } else {
          setMessages(() => [...historyMessages.messages.reverse()]);
        }
        if (isActiveChat?.client?.email === JONAH_EMAIL && !isFetched) {
          const from = isActiveChat?.client?.agoraUsername?.toLowerCase();
          const to = isActiveChat?.therapist?.agoraUsername?.toLowerCase();

          setMessages((prev) => [...JONAH_DEMO_MESSAGES(from, to), ...prev]);
        }
        if (isActiveChat?.client?.email === ALICE_EMAIL && !isFetched) {
          const from = isActiveChat?.client?.agoraUsername?.toLowerCase();
          const to = isActiveChat?.therapist?.agoraUsername?.toLowerCase();

          setMessages((prev) => [...ALICE_DEMO_MESSAGES(from, to), ...prev]);
        }
        console.log(historyMessages, 'historyMessages');
      }
      if (!!messages.length && isFirstFetch) {
        setIsFirstFetch(false);
      }
      if (!isFirstFetch) {
        setIsSecondFetch(true);
      }
      setLoading(false);
      if (failFetch) {
        setFailFetch(false);
      }
      setIsFetched(true);
    } catch (error: any) {
      setLoading(false);
      // await getAgoraRefreshToken()
      //   .then(async (res: any) => {
      //     if (!!res) {
      //       localStorage.setItem('user', JSON.stringify(res));
      //       // window.location.reload()
      //       await connection.renewToken(res?.agoraChatToken);
      //       await fetchOldMessages(agoraUsername);
      //       // setIsLoggedIn(false);
      //       // await loginUserAgora(res?.agoraUsername, res?.agoraChatToken);
      //     }
      //   })
      //   .catch((e) => {
      //     console.log('Refresh error', e);
      //   });
      console.error('Failed to fetch old messages', error);
      setFailFetch(true);
      setIsFetched(true);
    }
  };

  const handleCreateMessage = () => {
    const option: CreateMsgType = {
      chatType: 'singleChat',
      type: 'txt',
      to: agoraUsername,
      msg: message,
    };
    const msg = AC.message.create(option);
    return connection.send(msg);
  };

  const onClickItem = (item: any) => {
    if (item?.id !== isActiveChat?.id) {
      resetExercises();
      resetNote();
      if (currentUser?.paidStatus === PaidStatus.Paid || item?.isFirstInvited || page !== 'clients' || !user?.type) {
        if (isMobileScreen) {
          navigate(`${location.pathname}#selected_chat`);
          setIsActiveTab(((user?.type === USER_TYPES.THERAPIST && location.pathname.includes('shared-clients')) || !user?.uuid) ? 'Feed' : 'Messages');
        }
        setIsFetched(false);
        setFileThumbnail(undefined);
        setFile(undefined);
        setMessages([]);
        setIsActiveChat(item);
        const filteredScheduleData = bookingsData
          ?.filter((e: any) => e?.email === item?.client?.email)
          .sort((a: IScheduleCard, b: IScheduleCard) => {
            return b.date - a.date;
          });
        setScheduleData(filteredScheduleData);
        setIsActiveTab(((user?.type === USER_TYPES.THERAPIST && location.pathname.includes('shared-clients')) || !user?.uuid) ? 'Feed' : 'Messages');
      }else {
        toast.success('Please activate a plan to view clients')
      }
    }
  };

  const onClickTab = (label: string) => {
    if (label !== "Feed" && !user?.uuid) {
      console.log('label',label);
      navigate(`${USER_PUBLIC_BASE_URL}/${RoutesEnum.THERAPIST_SIGN_UP}`);
    } else if (label === 'View profile') {
      // navigate(`${VIEW_PUBLIC_BASE_URL}${isActiveChat?.therapist?.username}`);
      window.open(
        `${VIEW_PUBLIC_BASE_URL}${isActiveChat?.therapist?.username}`,
        '_blank',
      );
    } else {
      setIsActiveTab(label);
    }
  };

  const onBack = () => {
    setIsActiveTab('');
    setIsActiveChat(null);
    window.location.hash = '';
  };

  const onChangeInput = (e: any) => {
    setMessage(e.target.value);
  };

  const onAvatarClick = () => {
    window.open(`/${isActiveChat?.therapist?.username}`, '_self');
  };

  const onClickFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onClickFileMessage = async (src: string) => {
    const fileUrl = checkUrlAfterProtocol(src);
    const pdfViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
    window.open(pdfViewerUrl, '_blank');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(undefined);
    const file = event.target.files?.[0];
    if (file && file?.size > 10485760) {
      toast.error('Please upload files less than 10 MB');
    } else {
      setFile(file);
      if (!!file) {
        setFileThumbnail(URL.createObjectURL(file));
        setMessageDelete(false);
        setFileUploaded(true);
        modalHandlers.show();
      }
    }
  };

  const handleScroll = () => {
    if (
      !!chatRef.current &&
      chatRef.current.scrollTop === 0 &&
      !loading &&
      isActiveChat?.client
    ) {
      fetchOldMessages(agoraUsername);
    }
  };

  const handleScrollLists = () => {
    const listsDiv = listsRef.current;
    if (listsDiv) {
      const { scrollTop, scrollHeight, clientHeight } = listsDiv;
      if (scrollTop + clientHeight >= scrollHeight - 1) {
        // Adjusted for slight inaccuracy
        setListPageNum((prevPageNum) => prevPageNum + 1);
      }
    }
  };

  const getConversationList = async () => {
    if(user.uuid) {
      try {
        const result = await connection.getConversationlist({
          pageNum: listPageNum,
          pageSize: 100,
        });
        const channelInfos = result?.data?.channel_infos;
        const arrayWithNewMessages = result.data?.channel_infos?.filter(
          (e) => e?.unread_num,
        );
        if (channelInfos?.length) {
          setConversationsList(channelInfos);
          if (arrayWithNewMessages?.length) {
            let hasePageNewMessage = false;
            arrayWithNewMessages.forEach((item) => {
              const sender = item?.lastMessage?.from?.toLowerCase();
              const isPageNewMessage = conversations.some((el: any) => {
                const agoraUsername =
                  user?.type === USER_TYPES?.THERAPIST
                    ? el?.client?.agoraUsername?.toLowerCase()
                    : el?.therapist?.agoraUsername?.toLowerCase();
                setAgoraUsernames([...agoraUsernames, agoraUsername]);
                return sender === agoraUsername;
              });
              if (isPageNewMessage) {
                setNewMessage(isPageNewMessage);
                hasePageNewMessage = true;
              }
            });
            if (page === 'clients') {
              setNewMessagesClientsState(hasePageNewMessage);
              setNewMessage(hasePageNewMessage);
            } else {
              setNewMessagesState(hasePageNewMessage);
              setNewMessage(hasePageNewMessage);
            }
          } else {
            setNewMessage(false);
            setNewMessagesClientsState(false);
            setNewMessagesState(false);
          }
        }
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      }
    }
  };

  const isCreated = conversations.some((e: any) => e?.id === isActiveChat?.id);

  const onSend = async () => {
    if (!!message.length) {
      setMessage('');
      const requestBodyCreate =
        user?.type === USER_TYPES.THERAPIST
          ? { clientUuid: isActiveChat?.client?.uuid }
          : { therapistUuid: isActiveChat?.therapist?.uuid };
      const requestBodyUpdate =
        user?.type === USER_TYPES.THERAPIST
          ? { clientEmail: isActiveChat?.email }
          : { therapistUuid: isActiveChat?.therapist?.uuid };
      try {
        const resultSend = await handleCreateMessage();
        setMessages((prev) => [
          ...prev,
          {
            msg: message,
            from: user?.agoraUsername?.toLowerCase(),
            time: new Date().getTime(),
            id: resultSend?.message?.id,
          },
        ]);
        if (chatRef.current) {
          chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
        if (isCreated) {
          updateConversation(requestBodyUpdate);
          //Change order chat locally
          const activeIndex = newConversations.findIndex(
            (i: any) => i?.id === isActiveChat?.id,
          );
          if (activeIndex > -1) {
            const [activeChat] = newConversations?.splice(activeIndex, 1);
            newConversations?.unshift(activeChat);
          }
        } else {
          createConversation(requestBodyCreate);
          //Change order chat locally
          const activeIndex = newConversations.findIndex(
            (i: any) => i?.id === isActiveChat?.id,
          );
          if (activeIndex > -1) {
            const [activeChat] = newConversations?.splice(activeIndex, 1);
            newConversations?.unshift(activeChat);
          }
        }
      } catch (err) {
        // setIsLoggedIn(false);
        await getAgoraRefreshToken()
          .then((res: any) => {
            if (!!res) {
              localStorage.setItem('user', JSON.stringify(res));
              connection.renewToken(res.agoraChatToken);
              // loginUserAgora(res?.agoraUsername, res?.agoraChatToken);
            }
          })
          .catch((e) => {
            console.log('Refresh error', e);
          });
        console.log(err, 'no login');
      }
    }
    if (!!file) {
      onSendFile();
    }
  };

  const onSendFile = async () => {
    const requestBodyCreate =
      user?.type === USER_TYPES.THERAPIST
        ? { clientUuid: isActiveChat?.client?.uuid }
        : { therapistUuid: isActiveChat?.therapist?.uuid };

    const requestBodyUpdate =
      user?.type === USER_TYPES.THERAPIST
        ? { clientEmail: isActiveChat?.email }
        : { therapistUuid: isActiveChat?.therapist?.uuid };
    const input = document.getElementById('file');
    // @ts-ignore
    const file = AC.utils.getFileUrl(input);
    const allowType = {
      jpg: true,
      gif: true,
      png: true,
      jpeg: true,
      pdf: true,
    };
    if (file.filetype.toLowerCase() in allowType) {
      const option: any = {
        type: 'file',
        file: file,
        to: agoraUsername,
        chatType: 'singleChat',
        onFileUploadError: function () {
          console.log('onFileUploadError');
        },
        onFileUploadProgress: function (e: any) {
          console.log(e);
        },
        onFileUploadComplete: function () {
          console.log('onFileUploadComplete');
        },
        ext: { file_length: file.data.size },
      };
      const msg = AC.message.create(option);
      connection
        .send(msg)
        .then((res: any) => {
          modalHandlers.close();
          setFileUploaded(false);
          console.log('Success');
          setMessages((prev) => [
            ...prev,
            {
              url: res.message?.url,
              filename: file?.filename,
              time: new Date().getTime(),
              from: user?.agoraUsername.toLowerCase(),
              id: res?.message?.id,
            },
          ]);
          if (isCreated) {
            updateConversation(requestBodyUpdate);
            //Change order chat locally
            const activeIndex = newConversations.findIndex(
              (i: any) => i?.id === isActiveChat?.id,
            );
            if (activeIndex > -1) {
              const [activeChat] = newConversations?.splice(activeIndex, 1);
              newConversations?.unshift(activeChat);
            }
          } else {
            createConversation(requestBodyCreate);
            //Change order chat locally
            const activeIndex = newConversations.findIndex(
              (i: any) => i?.id === isActiveChat?.id,
            );
            if (activeIndex > -1) {
              const [activeChat] = newConversations?.splice(activeIndex, 1);
              newConversations?.unshift(activeChat);
            }
          }
          setFile(undefined);
          setFileThumbnail(undefined);
          if (input) {
            // @ts-ignore
            input.value = '';
          }
        })
        .catch(() => {
          console.log('Fail');
          setFile(undefined);
          setFileThumbnail(undefined);
          modalHandlers.close();
          setFileUploaded(false);
          if (input) {
            // @ts-ignore
            input.value = '';
          }
        });
    }
  };

  const exerciseUnJoin = async (uuid: string) => {
    try {
      await unJoinExercise({ email: isActiveChat?.email }, uuid);
      await getTherapistJoinedExercises(isActiveChat?.email);
    } catch (err) {
      console.log('error', err);
    }
  };

  const onCardClick = (card: any) => {
    if (card?.isActive) {
      viewExercise(card?.uuid);
      setExerciseUsersData({
        therapistUuid: isActiveChat?.therapist?.uuid,
        clientUuid: isActiveChat?.client?.uuid,
      });
      navigate(`${EXERCISE_PUBLIC_BASE_URL}/${card?.uuid}?from=internal`, {
        state: {
          therapistUuid: isActiveChat?.therapist?.uuid,
          clientUuid: isActiveChat?.client?.uuid,
        },
      });
    }
  };

  const onFavorite = async (isFavorite: boolean, uuid: string) => {
    try {
      if (!isFavorite) {
        await favoriteExercise(uuid);
      } else {
        await unFavoriteExercise(uuid);
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  const scrollToItem = (index: number) => {
    if (itemRefs.current[index]) {
      itemRefs.current[index]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  // useEffect(() => {
  //   if (!!user?.agoraChatToken && !!user?.agoraUsername && (!isLoggedIn || location.hash)) {
  //     loginUserAgora(user?.agoraUsername, user?.agoraChatToken);
  //   }
  // }, [isLoggedIn, location.hash]);

  useEffect(() => {
    connection.addEventHandler('connection&message', {
      onTextMessage: (message: AgoraChat.TextMsgBody) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            // @ts-ignore
            msg: message?.msg,
            from: message?.from,
            time: new Date().getTime(),
            id: message?.id,
          },
        ]);
        getConversationList();
        const findChat = newConversations?.find((chat) => {
          const fromUsername = message?.from?.toLowerCase();
          if (
            user?.type === USER_TYPES.THERAPIST &&
            fromUsername === chat?.client?.agoraUsername?.toLowerCase()
          ) {
            return true;
          }
          return (
            user?.type === USER_TYPES.CLIENT &&
            fromUsername === chat?.therapist?.agoraUsername?.toLowerCase()
          );
        });
        if (!findChat) {
          setIsNewChat(true);
        }
        const findIdx = newConversations.findIndex(
          (el) => el?.id === findChat?.id,
        );
        const [findedChat] = newConversations.splice(findIdx, 1);
        newConversations.unshift(findedChat);
      },
      onFileMessage: (message) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            // @ts-ignore
            msg: message?.sourceMsg,
            from: message?.from,
            time: new Date().getTime(),
            id: message?.id,
            url: message?.url,
          },
        ]);
        getConversationList();
        const findChat = newConversations?.find((chat) => {
          const fromUsername = message?.from?.toLowerCase();
          if (
            user?.type === USER_TYPES.THERAPIST &&
            fromUsername === chat?.client?.agoraUsername?.toLowerCase()
          ) {
            return true;
          }
          return (
            user?.type === USER_TYPES.CLIENT &&
            fromUsername === chat?.therapist?.agoraUsername?.toLowerCase()
          );
        });
        if (!findChat) {
          setIsNewChat(true);
        }
        const findIdx = newConversations.findIndex(
          (el) => el?.id === findChat?.id,
        );
        const [findedChat] = newConversations.splice(findIdx, 1);
        newConversations.unshift(findedChat);
      },
      onReceivedMessage: (msg) => {
        // @ts-ignore
        if (!!msg?.msg) {
          setMessages((prevMessages) => [...prevMessages, msg]);
        }
      },
      onRecallMessage: (recallMessage) => {
        getConversationList();
        setMessages((prevMessages) =>
          prevMessages.filter((message) => message.id !== recallMessage.mid),
        );
      },
      onTokenWillExpire: () => {
        getAgoraRefreshToken()
          .then((res: any) => {
            if (!!res) {
              localStorage.setItem('user', JSON.stringify(res));
              connection.renewToken(res?.agoraChatToken);
              // loginUserAgora(res?.agoraUsername, res?.agoraChatToken);
            }
          })
          .catch((e) => {
            console.log('Refresh error', e);
          });
      },
      onTokenExpired: () => {
        getAgoraRefreshToken()
          .then((res: any) => {
            if (!!res) {
              localStorage.setItem('user', JSON.stringify(res));
              connection.renewToken(res?.agoraChatToken);
              // loginUserAgora(res?.agoraUsername, res?.agoraChatToken);
            }
          })
          .catch((e) => {
            console.log('Refresh error', e);
          });
      },
      onDisconnected: () => {
        console.log('Disconnected');
      },
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === 'Enter') {
        onSend();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onSend]);

  useEffect(() => {
    const invitedClient = localStorage.getItem('invitedClient');
    const invitedTherapistEmail = localStorage.getItem('invitedTherapistEmail');
    const connectedFromChat = localStorage.getItem('connectedFromChat');
    const fromAddThisClientID = localStorage.getItem('fromAddThisClientID');
    const fromCarePlan = JSON.parse(localStorage.getItem('fromCarePlan') ?? '{}',);
    const fromActivityEmail = localStorage.getItem('fromActivityEmail');
    const fromStartMessaging =JSON.parse(localStorage.getItem('fromStartMessaging') ?? '{}');

    if (
      !isMobileScreen &&
      !!newConversations.length &&
      !searchParam &&
      !state?.from &&
      !state?.fromStartMessaging &&
      !exerciseUsers &&
      !invitedClient
    ) {
      setIsActiveChat(newConversations?.[0]);
      setIsActiveTab(((user?.type === USER_TYPES.THERAPIST && location.pathname.includes('shared-clients')) || !user?.uuid) ? 'Feed' : 'Messages');
      navigate(`${location.pathname}#selected_chat`);
      const filteredScheduleData = bookingsData
        ?.filter((e: any) => e?.email === newConversations?.[0]?.client?.email)
        .sort((a: IScheduleCard, b: IScheduleCard) => {
          return b.date - a.date;
        });
      if (filteredScheduleData?.length) {
        setScheduleData(filteredScheduleData);
      }
    }
    if (fromActivityEmail && !!newConversations?.length) {
      const findChat = newConversations?.find(
        (el: any) => el.client?.email === fromActivityEmail,
      );
      setIsActiveChat(findChat);
      const findIndex = newConversations?.findIndex(
        (el: any) => el.client?.email === fromActivityEmail,
      );
      if (findIndex) {
        scrollToItem(findIndex);
      }
      navigate(`${location.pathname}#selected_chat`);
      setIsActiveTab('Feed');
      setTimeout(() => {
        localStorage.removeItem('fromActivityEmail');
      }, 5000);
    }
    if (fromStartMessaging?.email && !!newConversations?.length) {
      setIsActiveTab('Messages');
      if (user?.type === USER_TYPES.THERAPIST) {
        const findChat = newConversations?.find(
          (el: any) => el.client?.email === fromStartMessaging?.email,
        );
        setIsActiveChat(findChat);
        const findIndex = newConversations?.findIndex(
          (el: any) => el.client?.email === fromStartMessaging?.email,
        );
        if (findIndex) {
          scrollToItem(findIndex);
        }
        navigate(`${location.pathname}#selected_chat`);
      } else {
        const findChat = newConversations?.find(
          (el: any) => el.therapist?.email === fromStartMessaging?.email,
        );
        setIsActiveChat(findChat);
        navigate(`${location.pathname}#selected_chat`);
      }
      setTimeout(() => {
        localStorage.removeItem('fromStartMessaging');
      }, 3000);
    }
    if (state?.from === 'viewMessage') {
      setIsActiveTab('Messages');
      setTimeout(() => {
        const findChat = newConversations?.find(
          (el: any) => el.therapist?.email === state?.therapist?.email,
        );
        if (!!findChat) {
          setIsActiveChat(findChat);
          const findIndex = newConversations?.findIndex(
            (el: any) => el.therapist?.email === state?.therapist?.email,
          );
          if (findIndex) {
            scrollToItem(findIndex);
          }
          navigate(`${location.pathname}#selected_chat`);
        } else {
          setNewConversations((prev) => [state, ...prev]);
          setMessages([]);
          setIsActiveChat(newConversations?.[0]);
        }
      }, 0);
    }
    if (!!fromCarePlan?.email && !!newConversations?.length) {
      const findChat = newConversations?.find(
        (el: any) => el.therapist?.email === fromCarePlan?.email,
      );
      if (!!findChat) {
        setIsActiveChat(findChat);
        setIsActiveTab('Care plan');
        const findIndex = newConversations?.findIndex(
          (el: any) => el.therapist?.email === fromCarePlan?.email,
        );
        if (findIndex) {
          scrollToItem(findIndex);
        }
        navigate(`${location.pathname}#selected_chat`);
        setTimeout(() => {
          localStorage.removeItem('fromCarePlan');
        }, 3000);
      } else {
        setTimeout(() => {
          setNewConversations((prev) => [state, ...prev]);
        }, 0);
      }
    }
    if (!!searchParam) {
      const findChat = newConversations?.find((el: any) => {
        return el?.id?.toString() == searchParam?.toString();
      });
      if (!!findChat) {
        setIsActiveChat(findChat);
        setIsActiveTab('Messages');
        const findIndex = newConversations?.findIndex(
          (el: any) => el?.id?.toString() == searchParam?.toString(),
        );
        if (findIndex) {
          scrollToItem(findIndex);
        }
        const queryString = `?chatId=${searchParam}`;
        navigate(`${location.pathname}${queryString}#selected_chat`, { replace: true });
      }
    }
    const from = localStorage.getItem('from');
    const username = localStorage.getItem('username');
    const newChatItem = JSON.parse(localStorage.getItem('newChatItem') ?? '{}');
    if (
      from &&
      username &&
      (from === 'view' ||
        (from === 'viewSession' && getConversationsStatus === 'SUCCESS'))
    ) {
      const findChat = newConversations?.find(
        (el: any) => el.therapist?.username === username,
      );
      if (findChat) {
        setIsActiveChat(findChat);
        navigate(`${location.pathname}#selected_chat`);
        localStorage.removeItem('from');
        localStorage.removeItem('username');
        localStorage.removeItem('newChatItem');
      } else if (!findChat) {
        setTimeout(() => {
          setNewConversations((prev) => [newChatItem, ...prev]);
          navigate(`${location.pathname}#selected_chat`);
        }, 0);
      }
    }
    if (
      newConversations.length &&
      !searchParam &&
      invitedClient &&
      user?.type === USER_TYPES.THERAPIST
    ) {
      const findChat = newConversations?.find(
        (el: any) => el?.email === invitedClient,
      );
      if (findChat) {
        setIsActiveChat(findChat);
        localStorage.removeItem('invitedClient');
        navigate(`${location.pathname}#selected_chat`);
      }
    }
    if (
      newConversations.length &&
      !searchParam &&
      invitedTherapistEmail &&
      user?.type === USER_TYPES.CLIENT
    ) {
      const findChat = newConversations?.find(
        (el: any) => el?.therapist?.email === invitedTherapistEmail,
      );
      if (findChat) {
        setIsActiveChat(findChat);
        const findIndex = newConversations?.findIndex(
          (el: any) => el?.therapist?.email === invitedTherapistEmail,
        );
        if (findIndex) {
          scrollToItem(findIndex);
        }
        localStorage.removeItem('invitedTherapistEmail');
        navigate(`${location.pathname}#selected_chat`);
        if (connectedFromChat) {
          setIsActiveTab('Care plan');
          localStorage.removeItem('connectedFromChat');
        }
      }
    }
    if (
      newConversations.length &&
      !searchParam &&
      fromAddThisClientID &&
      user?.type === USER_TYPES.THERAPIST
    ) {
      const findChat = newConversations?.find(
        (el: any) => el?.id.toString() === fromAddThisClientID.toString(),
      );
      if (findChat) {
        modalHandlers.show({ isActiveChat: findChat });
        setAddThisClientShow(true);
        setIsActiveChat(findChat);
        const findIndex = newConversations?.findIndex(
          (el: any) => el?.id.toString() === fromAddThisClientID.toString(),
        );
        if (findIndex) {
          scrollToItem(findIndex);
        }
        setIsActiveTab('Care');
        navigate(`${location.pathname}#selected_chat`);
      }
    }
    if (
      exerciseUsers &&
      !!newConversations.length &&
      !searchParam &&
      !invitedClient
    ) {
      if (user?.type === USER_TYPES.THERAPIST) {
        const findChat = newConversations?.find(
          (el: any) => el.client?.uuid === exerciseUsers?.clientUuid,
        );
        if (findChat) {
          // getTherapistJoinedExercises(
          //   findChat?.client?.email
          //     ? findChat?.client?.email
          //     : findChat?.email,
          // );
          setIsActiveChat(findChat);
          setIsActiveTab('Care');
          navigate(`${location.pathname}#selected_chat`);
        }
      }
      if (user?.type === USER_TYPES.CLIENT) {
        const findChat = newConversations?.find(
          (el: any) => el.therapist?.uuid === exerciseUsers?.therapistUuid,
        );
        if (findChat) {
          setIsActiveChat(findChat);
          const findIndex = newConversations?.findIndex(
            (el: any) => el.therapist?.uuid === exerciseUsers?.therapistUuid,
          );
          if (findIndex) {
            scrollToItem(findIndex);
          }
          setIsActiveTab('Care plan');
          navigate(`${location.pathname}#selected_chat`);
        }
      }
      resetExercisesData();
    }
  }, [newConversations, searchParam]);

  useEffect(() => {
    if (isActiveChat?.id) {
      if (isActiveChat?.client?.agoraUsername) {
        fetchOldMessages(agoraUsername);
      }
      if (user?.type === USER_TYPES.THERAPIST && isActiveChat?.email) {
        getTherapistJoinedExercises(
          isActiveChat?.client?.email
            ? isActiveChat?.client?.email
            : isActiveChat?.email,
        );
      }
      if (user?.type === USER_TYPES.CLIENT && isActiveChat?.therapist?.uuid) {
        getClientJoinedExercises(isActiveChat?.therapist?.uuid);
      }
    }
  }, [isActiveChat, joinExerciseStatus, unJoinExerciseStatus]);

  useEffect(() => {
    if (
      isActiveChat?.id &&
      newMessage &&
      messages?.length &&
      isActiveTab === 'Messages'
    ) {
      const option: CreateMsgType = {
        chatType: 'singleChat',
        type: 'channel',
        to: agoraUsername,
      };
      const msg = AC.message.create(option);
      connection
        .send(msg)
        .then(() => {
          getConversationList();
        })
        .catch((e) => {
          console.log('Error--- Send read receipts', e);
          // setIsLoggedIn(false)
          // loginUserAgora(user?.agoraUsername, user?.agoraChatToken);
        });
      navigate(`${location.pathname}#selected_chat`);
    }
  }, [messages?.length, newMessage, isActiveChat?.id, isActiveTab]);

  useEffect(() => {
    if (isFirstFetch && chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    } else if (!isSecondFetch && chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    } else if (!isFirstFetch && chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
    const chatElement = chatRef.current;
    if (chatElement) {
      chatElement.addEventListener('scroll', handleScroll);
      return () => {
        chatElement.removeEventListener('scroll', handleScroll);
      };
    }
  }, [messages?.length, isActiveTab, isFirstFetch, isSecondFetch]);

  useEffect(() => {
    if (conversations.length) {
      getConversationList();
    }
  }, [conversations, listPageNum]);

  useEffect(() => {
    setNewConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    if (isNewChat && page === 'inbox') {
      getConversations(0, 200, 1);
    }
    if (isNewChat && page === 'clients') {
      getConversations(0, 200, 2);
    }
  }, [isNewChat]);

  useEffect(() => {
    const listsDiv = listsRef.current;
    if (listsDiv) {
      listsDiv.addEventListener('scroll', handleScrollLists);
    }

    return () => {
      if (listsDiv) {
        listsDiv.removeEventListener('scroll', handleScrollLists);
      }
    };
  }, []);

  useEffect(() => {
    if (isActiveChat?.id) {
      const htmlElement = document.documentElement;
      htmlElement.style.overscrollBehavior = 'none';
      return () => {
        const htmlElement = document.documentElement;
        htmlElement.style.overscrollBehavior = 'auto';
      };
    }
  }, [isActiveChat?.id]);

  const onDeleteMessage = async (id: string) => {
    try {
      await connection.removeHistoryMessages({
        targetId: agoraUsername,
        chatType: 'singleChat',
        messageIds: [id],
      });
      const updatedMessages = messages.filter((message) => message.id !== id);
      setMessages(updatedMessages);
    } catch (e) {
      console.log(e);
    }
  };

  const onDeleteMessageEveryone = async (id: string) => {
    try {
      // await connection.removeHistoryMessages({
      //   targetId: agoraUsername,
      //   chatType: 'singleChat',
      //   messageIds: [id],
      // });
      await connection.recallMessage({
        mid: id,
        to: agoraUsername,
        type: 'chat',
        chatType: 'singleChat',
      });

      const updatedMessages = messages.filter((message) => message.id !== id);
      setMessages(updatedMessages);
      // await loginUserAgora(messageMenu?.otherAgoraUsername, messageMenu?.otherAgoraToken);
      // await connection.removeHistoryMessages({
      //   targetId: messageMenu?.ownAgoraUsername,
      //   chatType: 'singleChat',
      //   messageIds: [id],
      // });
      // await loginUserAgora(user?.agoraUsername, user?.agoraChatToken);
    } catch (e) {
      console.log(e);
      toast.error('You cannot delete a message after 7 days of sending');
    }
  };

  const deleteChat = async (
    id: number,
    agoraUsername: string,
    agoraUsernameOther: string,
    agoraChatToken: string,
  ) => {
    setFileUploaded(false);
    setMessageDelete(true);
    modalHandlers.show({
      id: id,
      agoraUsername,
      agoraUsernameOther,
      agoraChatToken,
    });
  };

  const onDeleteChat = async () => {
    try {
      await connection.deleteConversation({
        channel: `${modalHandlers?.metaData?.agoraUsernameOther?.toLowerCase()}`,
        chatType: 'singleChat',
        deleteRoam: true,
      });
      //for deleting to side messages
      // await loginUserAgora(
      //   modalHandlers?.metaData?.agoraUsernameOther,
      //   modalHandlers?.metaData?.agoraChatToken,
      // );
      // await connection.deleteConversation({
      //   channel: `${modalHandlers?.metaData?.agoraUsername?.toLowerCase()}`,
      //   chatType: 'singleChat',
      //   deleteRoam: true,
      // });
      // await loginUserAgora(user?.agoraUsername, user?.agoraChatToken);
      if (
        conversations?.some((e: any) => e?.id === modalHandlers?.metaData?.id)
      ) {
        if (page === 'clients') {
          await removeClientsConversation(modalHandlers?.metaData?.id);
        } else {
          await removeConversation(modalHandlers?.metaData?.id);
        }
        setMessageDelete(false);
        const filteredConversations = newConversations?.filter(
          (e: any) => e.id !== modalHandlers?.metaData?.id,
        );
        setNewConversations(filteredConversations);
        navigate(location.pathname, { state: null });
      } else {
        const filteredConversations = newConversations?.filter(
          (e: any) => e.id !== modalHandlers?.metaData?.id,
        );
        setNewConversations(filteredConversations);
        navigate(location.pathname, { state: null });
      }
      if (page === 'clients') {
        await getConversations(0, 200, 2);
      } else {
        await getConversations(0, 200, 1);
      }
    } catch (e: any) {
      console.log('Error', e);
    }
  };

  const handleRightClickMyMessage = (
    event: any,
    messageId: string,
    ownAgoraUsername: string,
    otherAgoraUsername: string,
    otherAgoraToken: string,
  ) => {
    event.preventDefault();
    const root = document.getElementById('root');
    if (!!root) {
      if (root.offsetWidth - event.clientX >= 100) {
        setMessageMenu({
          visible: true,
          x: event.clientX,
          y: event.clientY,
          messageId: messageId,
          ownAgoraUsername: ownAgoraUsername,
          otherAgoraUsername: otherAgoraUsername,
          otherAgoraToken: otherAgoraToken,
        });
      } else {
        setMessageMenu({
          visible: true,
          x: root.offsetWidth - 140,
          y: event.clientY,
          messageId: messageId,
          ownAgoraUsername: ownAgoraUsername,
          otherAgoraUsername: otherAgoraUsername,
          otherAgoraToken: otherAgoraToken,
        });
      }
    }
  };

  const handleRightClickOtherMessage = (
    event: any,
    messageId: string,
    ownAgoraUsername: string,
    otherAgoraUsername: string,
    otherAgoraToken: string,
  ) => {
    event.preventDefault();
    const root = document.getElementById('root');
    if (!!root) {
      if (root.offsetWidth - event.clientX >= 100) {
        setMessageMenuOther({
          visible: true,
          x: event.clientX,
          y: event.clientY,
          messageId: messageId,
          ownAgoraUsername: ownAgoraUsername,
          otherAgoraUsername: otherAgoraUsername,
          otherAgoraToken: otherAgoraToken,
        });
      } else {
        setMessageMenuOther({
          visible: true,
          x: root.offsetWidth - 170,
          y: event.clientY,
          messageId: messageId,
          ownAgoraUsername: ownAgoraUsername,
          otherAgoraUsername: otherAgoraUsername,
          otherAgoraToken: otherAgoraToken,
        });
      }
    }
  };

  const handleRightClickChat = (
    e: any,
    idChat: number,
    agoraUsername: string,
    agoraUsernameOther: string,
    agoraToken: string,
  ) => {
    e.preventDefault();
    const root = document.getElementById('root');
    if (!!root) {
      if (root?.offsetWidth - e?.clientX >= 100) {
        setMessageMenuChat({
          visible: true,
          x: e?.clientX,
          y: e?.clientY,
          chatId: idChat,
          agoraUsername,
          agoraUsernameOther,
          agoraToken,
        });
      } else {
        setMessageMenuChat({
          visible: true,
          x: root?.offsetWidth - 90,
          y: e?.clientY,
          chatId: idChat,
          agoraUsername,
          agoraUsernameOther,
          agoraToken,
        });
      }
    }
  };

  const onTouchMessage = (e: any, id: string) => {
    const timer = setTimeout(() => handleLongPress(e, id), 500);
    e.target.addEventListener('touchend', () => clearTimeout(timer));
    e.target.addEventListener('touchmove', () => clearTimeout(timer));
  };

  const onTouchChat = (e: any, id: string) => {
    const timer = setTimeout(() => handleLongPressChat(e, id), 500);
    e.target.addEventListener('touchend', () => clearTimeout(timer));
    e.target.addEventListener('touchmove', () => clearTimeout(timer));
  };

  const handleLongPress = (event: any, messageId: string) => {
    event.preventDefault();

    const touch = event.touches[0];
    setMessageMenu({
      visible: true,
      x: touch.clientX,
      y: touch.clientY,
      messageId: messageId,
    });
  };

  const handleLongPressChat = (event: any, chatId: string) => {
    event.preventDefault();

    const touch = event.touches[0];
    setMessageMenuChat({
      visible: true,
      x: touch.clientX,
      y: touch.clientY,
      chatId: chatId,
    });
  };

  const handleClickOutside = () => {
    setMessageMenu(null);
    setMessageMenuOther(null);
    setMessageMenuChat(null);
  };

  const onAddCardClick = () => {
    setAddThisClientShow(true);
    modalHandlers.show({ isActiveChat });
  };

  const filteredMessages = messages?.filter((e) => e.time);
  const onlyOneDayMessages = areMessagesOnSameDay(filteredMessages);
  const careData =
    user?.type === USER_TYPES.THERAPIST
      ? joinedTherapistExercises
      : joinedClientExercises;

  useEffect(() => {
    if (isMobileScreen && !location.hash && isActiveChat?.id) {
      setIsActiveChat(null);
      const element = document.getElementById('therapistLayoutContainer');
      if (element) {
        element.style.padding = '8px 20px';
      }
    }
  }, [location]);

  const handleDotsClick = (e: any) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev); // Toggle visibility
  };

  const handleClickOutsideSharingBlock = (e: any) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutsideSharingBlock);
    return () => {
      document.removeEventListener('click', handleClickOutsideSharingBlock);
    };
  }, []);

  useEffect(() => {
    const element = document.getElementById('therapistLayoutContainer');
    if (!element) return;

    if (isActiveTab === 'Feed' && isMobileScreen && location.hash) {
      element.style.padding = '8px 0px';
    } else if (isMobileScreen) {
      element.style.padding = '8px 20px';
    }
  }, [isActiveTab, location]);

  return (
    <div
      className={cn(styles.chatWrapper, {
        [styles.signoutChatWrapper]: !user?.type && !isActiveChat,
        [styles.inTimeFeed]: isActiveTab === 'Feed',
      })}
      onClick={handleClickOutside}
    >
      {((isMobileScreen && !isActiveChat) ||
        (!isMobileScreen && isActiveChat) ||
        (!isMobileScreen && !newConversations?.length)) && (
        <div className={cn(styles.listBlock, {[styles.listBlockSignoutMobile]: !user?.type})}>
          <div className={styles.titleBlock}>
            {(user?.type === USER_TYPES.THERAPIST || !user.type )? (
              <span className={cn(styles.title, {[styles.signoutMobileTitle]:isMobileScreen && !user?.type})}>
                {page === 'inbox' ? 'Messages' : 'Clients'}
              </span>
            ) : (
              <div className={styles.clientsChatTitle}>
                <span className={styles.title}>Messages</span>
                {isMobileScreen && (
                  <i className={cn('icon-plus')}></i>
                )}
              </div>
            )}
          </div>
          <div ref={listsRef} className={styles.lists}>
            {!!newConversations?.length ? (
              <>
                {(user?.type === USER_TYPES.THERAPIST || !user?.type) ? (
                  <>
                    {newConversations?.map((item: any, index: number) => {
                      const usernameAgora =
                        item?.client?.agoraUsername?.toLowerCase();
                      const findItem = conversationsList.find(
                        (el) =>
                          extractUsername(el?.channel_id) === usernameAgora,
                      );
                      return (
                        <div
                          key={item?.id}
                          ref={(el) => (itemRefs.current[index] = el)}
                          className={cn(styles.listItem, {
                            [styles.listItemNotMobile]: !isMobileScreen,
                            [styles.activeChat]:
                              isActiveChat?.email === item?.email,
                          })}
                          onClick={() => {
                            onClickItem(item);
                          }}
                          onContextMenu={(e) => {
                            handleRightClickChat(
                              e,
                              item?.id,
                              user?.type === USER_TYPES.THERAPIST
                                ? item?.therapist?.agoraUsername
                                : item?.client?.agoraUsername,
                              user?.type === USER_TYPES.THERAPIST
                                ? item?.client?.agoraUsername
                                : item?.therapist?.agoraUsername,
                              user?.type === USER_TYPES.THERAPIST
                                ? item?.client?.agoraChatToken
                                : item?.therapist?.agoraChatToken,
                            );
                          }}
                          onTouchStart={(e) => {
                            onTouchChat(e, item?.id);
                          }}
                        >
                          <div
                            className={cn(styles.badge, {
                              [styles.chatlistAvatar]: isMobileScreen,
                              [styles.activeChatBadge]:
                                isActiveChat?.id === item?.id,
                            })}
                          >
                            <span className={styles.bold2}>
                              {getInitialsLetters(
                                item?.client?.name
                                  ? item?.client?.name
                                  : item?.name,
                              )}
                            </span>
                          </div>
                          <span className={styles.bold}>
                            {item?.client?.name
                              ? item?.client?.name
                              : item?.name}
                          </span>
                          {!!findItem?.unread_num && (
                            <span
                              className={cn(styles.greenDot, styles.end)}
                            ></span>
                          )}
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <>
                    {newConversations?.map((item: any) => {
                      const usernameAgora =
                        item?.therapist?.agoraUsername?.toLowerCase();
                      const findItem = conversationsList.find(
                        (el) =>
                          extractUsername(el?.channel_id) === usernameAgora,
                      );
                      return (
                        <div
                          key={item?.id}
                          className={cn(styles.listItem, {
                            [styles.listItemNotMobile]: !isMobileScreen,
                            [styles.activeChat]:
                              isActiveChat?.therapist?.email ===
                              item?.therapist?.email,
                          })}
                          onClick={() => {
                            onClickItem(item);
                          }}
                          onContextMenu={(e) => {
                            handleRightClickChat(
                              e,
                              item?.id,
                              user?.type === USER_TYPES.THERAPIST
                                ? item?.therapist?.agoraUsername
                                : item?.client?.agoraUsername,
                              user?.type === USER_TYPES.THERAPIST
                                ? item?.client?.agoraUsername
                                : item?.therapist?.agoraUsername,
                              user?.type === USER_TYPES.THERAPIST
                                ? item?.client?.agoraChatToken
                                : item?.therapist?.agoraChatToken,
                            );
                          }}
                          onTouchStart={(e) => {
                            onTouchChat(e, item?.id);
                          }}
                        >
                          <Avatar
                            className={cn(styles.avatar, styles.chatlistAvatar)}
                            photoUrl={item?.therapist?.image}
                          />
                          <span className={styles.bold}>
                            {item?.therapist?.name}
                          </span>
                          {!!findItem?.unread_num && (
                            <span
                              className={cn(styles.greenDot, styles.end)}
                            ></span>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
              </>
            ) : (
              <>
                {user?.type === USER_TYPES.THERAPIST && (
                  <span className={cn(styles.label, styles.noListText)}>
                    No clients yet
                  </span>
                )}
                {user?.type === USER_TYPES.CLIENT && (
                  <span className={cn(styles.label, styles.noListText)}>
                    No therapists yet
                  </span>
                )}
              </>
            )}
          </div>

          {user?.type !== USER_TYPES.CLIENT && (
            <div className={styles.addClientBlock}>
              {page === 'clients' && (
                <Button
                  fullWidth
                  className={cn(styles.addButton, {
                    [styles.mobileButton]: isMobileScreen,
                  })}
                  variant={'primary'}
                  iconClassName={styles.plusIcon}
                  icon={isMobileScreen ? 'plus' : ''}
                  label={isMobileScreen ? '' : 'Add Client'}
                  onClick={() => (onAddClick ? onAddClick() : null)}
                />
              )}
            </div>
          )}
          {user?.type === USER_TYPES.CLIENT && !user?.acceptedCounts && (
            <div
              className={cn(styles.addClientBlock, {
                [styles.clientConnectWrapper]: user?.type === USER_TYPES.CLIENT,
              })}
            >
              <Button
                fullWidth
                className={cn(styles.addButton)}
                variant={'secondary'}
                label={'Connect your therapist'}
                onClick={() => (onConnectClick ? onConnectClick() : null)}
              />
            </div>
          )}
        </div>
      )}
      {((isMobileScreen && isActiveChat) ||
        (!isMobileScreen && isActiveChat) ||
        (!isMobileScreen && !newConversations?.length)) && (
        <div className={cn(styles.messageBlock)}>
          <div
            className={cn(styles.titleBlock, styles.withDots, {
              [styles.titleBlockFeeds]: isActiveTab === 'Feed',
            })}
          >
            {isMobileScreen && (
              <i
                className={cn('icon-left-arrow', styles.backIcon, {
                  [styles.backIconFeed]: isActiveTab === 'Feed',
                })}
                onClick={onBack}
              />
            )}
            {user?.type === USER_TYPES.CLIENT && !!isActiveChat && (
              <Avatar
                onClick={onAvatarClick}
                className={cn(styles.avatar, {
                  [styles.selectedChatAvatar]: isMobileScreen,
                })}
                photoUrl={isActiveChat?.therapist?.image}
              />
            )}
            <span
              className={cn(styles.bold3, {
                [styles.leftMarginTitle]: isMobileScreen,
                [styles.leftWithImage]: user?.type === USER_TYPES.CLIENT,
              })}
            >
              {name ? name : isActiveChat?.name}
            </span>
            {user?.type === USER_TYPES.CLIENT && isActiveChat?.isAccepted && (
              <span
                ref={dotsRef}
                className={styles.dotsWrapper}
                onClick={handleDotsClick}
              >
                <i className={cn('icon-dots', styles.dotsIcon)} />
                {isOpen && (
                  <ShareController
                    switchs={switchs}
                    setSwitchs={setSwitchs}
                    isActiveChat={isActiveChat}
                    setIsOpen={setIsOpen}
                    isActive={isActiveChat?.shareOffloads}
                  />
                )}
              </span>
            )}
            {page === 'inbox' && (
              <span
                className={styles.addToClientButton}
                onClick={() =>
                  onAddClick ? onAddClick(isActiveChat?.client) : null
                }
              >
                Add to clients
              </span>
            )}
            {page === 'clients' && isActiveChat?.id && user.uuid && (
              <div className={styles.clientStatusWrapper}>
                {isActiveChat?.isAccepted ? (
                  <div className={styles.checkWrapper}>
                    <i className={cn('icon-check')} />
                  </div>
                ) : (
                  <span className={styles.label}>Invite sent</span>
                )}
              </div>
            )}
          </div>
          {((user?.type === USER_TYPES.THERAPIST && !!isActiveChat) || !user?.uuid) && (
            <div className={styles.tabsMain}>
              <div
                className={cn(styles.tabsBlock, {
                  [styles.tabsWithFeed]: isActiveTab === 'Feed',
                  [styles.tabsClients]: page === 'clients' || page === 'inbox',
                })}
              >
                {tabsData?.map((item: any, idx) => {
                  return (
                    <div
                      key={item?.id}
                      className={cn(styles.tab, {
                        [styles.isActiveTab]: isActiveTab === item?.label,
                      })}
                      onClick={() => {
                        onClickTab(item?.label);
                      }}
                    >
                      <span className={styles.bold}>{item.label}</span>
                      {idx === 2 &&
                        newMessage &&
                        agoraUsernames?.includes(
                          isActiveChat?.client?.agoraUsername.toLowerCase(),
                        ) && <span className={styles.greenDot}></span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {user?.type === USER_TYPES.CLIENT && !!isActiveChat && (
            <div className={styles.tabsMain}>
              <div
                className={cn(styles.tabsBlock, {
                  [styles.clientTabs]: user?.type === USER_TYPES.CLIENT,
                })}
              >
                {clientChatTabs?.map((item: any, idx) => {
                  return (
                    <div
                      key={item?.id}
                      className={cn(styles.tab, {
                        [styles.isActiveTab]: isActiveTab === item?.label,
                      })}
                      onClick={() => {
                        onClickTab(item?.label);
                      }}
                    >
                      <span className={styles.bold}>{item.label}</span>
                      {idx === 0 &&
                        newMessage &&
                        agoraUsernames?.includes(
                          isActiveChat?.therapist?.agoraUsername.toLowerCase(),
                        ) && <span className={styles.greenDot}></span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {!filteredMessages?.length &&
            !!newConversations?.length &&
            isActiveTab === 'Messages' &&
            !loading &&
            isFetched && (
              <div className={styles.noMessagesWrapper}>
                <span className={styles.label}>No messages to show.</span>
                <span className={styles.label}>
                  Messages are encrypted, not even Offload can see them.
                </span>
                <span className={styles.label}>
                  Any messages older than 7 days are deleted for extra security.
                </span>
              </div>
            )}
          {isActiveTab === 'Messages' && (
            <div ref={chatRef} className={styles.messageMain}>
              {/*{loading && (*/}
              {/*  <div className={styles.loaderWrapper}>*/}
              {/*    <SmallLoader />*/}
              {/*  </div>*/}
              {/*)}*/}
              {isFetched &&
                filteredMessages?.map((item: any, idx: number) => {
                  const senderChange =
                    filteredMessages[idx + 1]?.from &&
                    filteredMessages[idx]?.from !==
                      filteredMessages[idx + 1]?.from;
                  const fromClient = isActiveChat?.client?.agoraUsername;
                  const fromTherapist = isActiveChat?.therapist?.agoraUsername;
                  const date = filteredMessages[idx - 1]?.time
                    ? dateFormatter2(filteredMessages[idx - 1]?.time)
                    : dateFormatter2(filteredMessages[idx]?.time);
                  // const currentDate = new Date(item.time);
                  // const prevDate =
                  //   idx > 0 ? new Date(messages[idx - 1].time) : null;
                  // const shouldPrintDate =
                  //   !prevDate || !isSameDay(currentDate, prevDate);

                  if (
                    item?.from === fromClient?.toLowerCase() ||
                    item?.from === fromTherapist?.toLowerCase()
                  ) {
                    return (
                      <>
                        {onlyOneDayMessages && idx === 0 && (
                          <span key={item.time} className={styles.time}>
                            {dateFormatter2(item.time)}
                          </span>
                        )}
                        {dateFormatter2(filteredMessages[idx]?.time) !== date &&
                          item?.time && (
                            <span key={item.time} className={styles.time}>
                              {dateFormatter2(item.time)}
                            </span>
                          )}
                        {(!!item?.msg || item?.url) && (
                          <div
                            className={cn(styles.messageRow, {
                              [styles.myMessageRow]:
                                user?.agoraUsername?.toLowerCase() ===
                                item?.from,
                              [styles.widthMargin]: senderChange,
                            })}
                            key={item?.id}
                          >
                            {!!item?.msg && (
                              <span
                                onTouchStart={(e) => {
                                  onTouchMessage(e, item?.id);
                                }}
                                onContextMenu={(e) => {
                                  if (
                                    user?.agoraUsername?.toLowerCase() ===
                                    item?.from
                                  ) {
                                    handleRightClickMyMessage(
                                      e,
                                      item?.id,
                                      user?.type === USER_TYPES.THERAPIST
                                        ? isActiveChat?.therapist?.agoraUsername
                                        : isActiveChat?.client?.agoraUsername,
                                      user?.type === USER_TYPES.THERAPIST
                                        ? isActiveChat?.client?.agoraUsername
                                        : isActiveChat?.therapist
                                            ?.agoraUsername,
                                      user?.type === USER_TYPES.THERAPIST
                                        ? isActiveChat?.client?.agoraUsername
                                        : isActiveChat?.therapist
                                            ?.agoraChatToken,
                                    );
                                  } else {
                                    handleRightClickOtherMessage(
                                      e,
                                      item?.id,
                                      user?.type === USER_TYPES.THERAPIST
                                        ? isActiveChat?.therapist?.agoraUsername
                                        : isActiveChat?.client?.agoraUsername,
                                      user?.type === USER_TYPES.THERAPIST
                                        ? isActiveChat?.client?.agoraUsername
                                        : isActiveChat?.therapist
                                            ?.agoraUsername,
                                      user?.type === USER_TYPES.THERAPIST
                                        ? isActiveChat?.client?.agoraUsername
                                        : isActiveChat?.therapist
                                            ?.agoraChatToken,
                                    );
                                  }
                                }}
                                key={item?.id}
                                className={cn(styles.message, {
                                  [styles.myMessage]:
                                    user?.agoraUsername?.toLowerCase() ===
                                    item?.from,
                                  [styles.hisMessage]:
                                    user?.agoraUsername?.toLowerCase() !==
                                    item?.from,
                                })}
                              >
                                {item?.msg}
                              </span>
                            )}
                            {!!item?.url &&
                              getFileType(item?.filename) !== 'pdf' && (
                                <span
                                  onContextMenu={(e) => {
                                    if (
                                      user?.agoraUsername?.toLowerCase() ===
                                      item?.from
                                    ) {
                                      handleRightClickMyMessage(
                                        e,
                                        item?.id,
                                        user?.type === USER_TYPES.THERAPIST
                                          ? isActiveChat?.therapist
                                              ?.agoraUsername
                                          : isActiveChat?.client?.agoraUsername,
                                        user?.type === USER_TYPES.THERAPIST
                                          ? isActiveChat?.client?.agoraUsername
                                          : isActiveChat?.therapist
                                              ?.agoraUsername,
                                        user?.type === USER_TYPES.THERAPIST
                                          ? isActiveChat?.client?.agoraUsername
                                          : isActiveChat?.therapist
                                              ?.agoraChatToken,
                                      );
                                    } else {
                                      handleRightClickOtherMessage(
                                        e,
                                        item?.id,
                                        user?.type === USER_TYPES.THERAPIST
                                          ? isActiveChat?.therapist
                                              ?.agoraUsername
                                          : isActiveChat?.client?.agoraUsername,
                                        user?.type === USER_TYPES.THERAPIST
                                          ? isActiveChat?.client?.agoraUsername
                                          : isActiveChat?.therapist
                                              ?.agoraUsername,
                                        user?.type === USER_TYPES.THERAPIST
                                          ? isActiveChat?.client?.agoraUsername
                                          : isActiveChat?.therapist
                                              ?.agoraChatToken,
                                      );
                                    }
                                  }}
                                  onTouchStart={(e) => {
                                    onTouchMessage(e, item?.id);
                                  }}
                                >
                                  <ImageWithLoader url={item?.url} />
                                </span>
                              )}
                            {!!item?.url &&
                              getFileType(item?.filename) === 'pdf' && (
                                <span
                                  className={cn(
                                    styles.message,
                                    styles.fileMessage,
                                    {
                                      [styles.myMessage]:
                                        user?.agoraUsername?.toLowerCase() ===
                                        item?.from,
                                      [styles.hisMessage]:
                                        user?.agoraUsername?.toLowerCase() !==
                                        item?.from,
                                    },
                                  )}
                                  onContextMenu={(e) => {
                                    if (
                                      user?.agoraUsername?.toLowerCase() ===
                                      item?.from
                                    ) {
                                      handleRightClickMyMessage(
                                        e,
                                        item?.id,
                                        user?.type === USER_TYPES.THERAPIST
                                          ? isActiveChat?.therapist
                                              ?.agoraUsername
                                          : isActiveChat?.client?.agoraUsername,
                                        user?.type === USER_TYPES.THERAPIST
                                          ? isActiveChat?.client?.agoraUsername
                                          : isActiveChat?.therapist
                                              ?.agoraUsername,
                                        user?.type === USER_TYPES.THERAPIST
                                          ? isActiveChat?.client?.agoraUsername
                                          : isActiveChat?.therapist
                                              ?.agoraChatToken,
                                      );
                                    } else {
                                      handleRightClickOtherMessage(
                                        e,
                                        item?.id,
                                        user?.type === USER_TYPES.THERAPIST
                                          ? isActiveChat?.therapist
                                              ?.agoraUsername
                                          : isActiveChat?.client?.agoraUsername,
                                        user?.type === USER_TYPES.THERAPIST
                                          ? isActiveChat?.client?.agoraUsername
                                          : isActiveChat?.therapist
                                              ?.agoraUsername,
                                        user?.type === USER_TYPES.THERAPIST
                                          ? isActiveChat?.client?.agoraUsername
                                          : isActiveChat?.therapist
                                              ?.agoraChatToken,
                                      );
                                    }
                                  }}
                                  onTouchStart={(e) => {
                                    onTouchMessage(e, item?.id);
                                  }}
                                  onClick={() => {
                                    onClickFileMessage(item?.url);
                                  }}
                                >
                                  <img
                                    style={{ marginRight: 8 }}
                                    src={FileLogo}
                                    alt="file"
                                  />{' '}
                                  {truncateFileName(item?.filename)}
                                </span>
                              )}
                          </div>
                        )}
                      </>
                    );
                  }
                })}
            </div>
          )}
          {isActiveTab === 'Care' && (
            <div className={styles.careBlockWrapper}>
              <AddClientCard onCardClick={onAddCardClick} />
              {getTherapistJoinedExercisesStatus === 'SUCCESS' &&
                careData?.map((item: any) => {
                  return (
                    <ExerciseCard
                      cardData={item}
                      className={styles.exerciseItem}
                      size={isMobileScreen ? 'medium' : 'small'}
                      onActionClick={() => {
                        exerciseUnJoin(item.uuid);
                      }}
                      onCardClick={onCardClick}
                      isDeletable
                      onFavoriteClick={onFavorite}
                    />
                  );
                })}
              {getTherapistJoinedExercisesStatus === 'LOADING' && (
                <div>
                  <LoadingScreen className={styles.exercisesLoading} />
                </div>
              )}
            </div>
          )}
          {isActiveTab === 'Care plan' && (
            <div className={styles.careBlockWrapper}>
              {!careData?.length && isActiveChat?.isAccepted && (
                <span className={styles.label}>
                  Nothing added by your therapist yet
                </span>
              )}
              {isActiveChat?.isAccepted &&
                careData?.map((item: any) => {
                  return (
                    <ExerciseCard
                      cardData={item}
                      className={styles.exerciseItem}
                      size={isMobileScreen ? 'medium' : 'small'}
                      onActionClick={() => {
                        exerciseUnJoin(item.uuid);
                      }}
                      onCardClick={onCardClick}
                      onFavoriteClick={onFavorite}
                    />
                  );
                })}
              {!isActiveChat?.isAccepted && (
                <div className={styles.therapistBlockWrapper}>
                  <div className={styles.therapistsMain}>
                    <div className={styles.avatarsWrapper}>
                      <img
                        src={Therapists}
                        alt="img"
                        className={styles.therapists}
                      />
                    </div>
                    <span className={styles.therapistsInfoLabel}>
                      Get a care plan, send messages, book sessions and more.
                    </span>
                    <Button
                      label={'Connect your therapist'}
                      className={styles.connectButton}
                      onClick={onConnectClick}
                    />
                    <img
                      className={styles.blackKross}
                      src={BlackStar}
                      alt="blackStar"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          {isActiveTab === 'Feed' && isActiveChat?.isAccepted && (
            <div
              className={cn(styles.feedWrapper, {
                [styles.feedWrapperWithoutData]: !isFeedData,
              })}
            >
              <Feed
                withTitle={false}
                clientUuid={isActiveChat?.client?.uuid}
                setIsFeedData={setIsFeedData}
              />
            </div>
          )}
          {isActiveTab === 'Feed' && !isActiveChat?.isAccepted && (
            <div
              className={cn(styles.feedWrapperWithoutData)}
            >
              <span className={styles.label} style={{marginLeft: 20}}>
                No feed data because the client has not connected yet
              </span>
            </div>
          )}

          {isActiveTab === 'Bookings' && (
            <div className={styles.cardsWrapper}>
              {!scheduleData?.length && (
                <span className={styles.label}>No bookings yet</span>
              )}
              {scheduleData?.map((item: IScheduleCard, idx: number) => {
                const today = new Date();
                const formattedToday = format(today, 'dd MMM');
                const {
                  id,
                  type,
                  creator,
                  date,
                  name,
                  day,
                  startTime,
                  endTime,
                  isInPerson,
                  isLiveText,
                  isVideoCall,
                  isVoiceCall,
                } = item;

                const duration = type === 1 ? 30 : type === 2 ? 50 : 15;
                const disabled =
                  Date.now() > date * 1000 + duration * 60 * 1000;

                return (
                  <div key={id} className={styles.block}>
                    {scheduleData[idx]?.day !== scheduleData[idx - 1]?.day ? (
                      <div
                        className={cn(styles.badgeTime, {
                          [styles.activeDay]: day === formattedToday,
                          [styles.disabledBadge]: disabled,
                        })}
                      >
                        <span className={styles.day}>{day?.split(' ')[0]}</span>
                        <span className={styles.mount}>
                          {day?.split(' ')[1]}
                        </span>
                      </div>
                    ) : (
                      <div className={styles.space} />
                    )}
                    <div className={styles.cardsBlock}>
                      <ScheduleCard
                        onClick={() => {
                          if (onClickCard) {
                            onClickCard(item);
                          }
                        }}
                        key={id}
                        disabled={disabled}
                        className={styles.card}
                        name={creator?.name ? creator?.name : name ? name : ''}
                        end_time={endTime?.toLowerCase()}
                        start_time={startTime?.toLowerCase()}
                        session_type={type === 3 ? 'consultation' : 'session'}
                        type={getTypeCall(
                          isInPerson,
                          isLiveText,
                          isVideoCall,
                          isVoiceCall,
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {isActiveTab === 'Notes' && (
            <NotesClients clientUuid={isActiveChat?.client?.uuid} />
          )}
          {isActiveTab === 'Messages' && !!newConversations?.length && (
            <div className={styles.actionBlock}>
              <input
                id={'file'}
                accept="image/jpeg, image/jpg, image/gif, image/png, .pdf"
                type="file"
                ref={fileInputRef}
                className={styles.fileInput}
                onChange={handleFileChange}
              />
              <div
                className={cn(styles.badge, styles.big)}
                onClick={onClickFile}
              >
                <i className={cn('icon-plus')} />
              </div>
              <Input
                disabled={!isActiveChat}
                value={message}
                variant={'secondary'}
                className={styles.input}
                placeholder={'Send a message...'}
                onChange={onChangeInput}
              />
              <div
                className={cn(styles.badge, styles.send, {
                  [styles.sendDisabled]: !message,
                })}
                onClick={onSend}
              >
                <i className={cn('icon-send', styles.sendIcon)} />
              </div>
            </div>
          )}
        </div>
      )}
      {fileUploaded && (
        <AppModal className={styles.modal} width={576} {...modalHandlers}>
          <div className={styles.sendFileWrapper}>
            <div className={styles.fileBody}>
              {!!file && getFileType(file?.type) === 'application/pdf' ? (
                <div className={styles.pdfBlockWrapper}>
                  <img src={PdfLogo} alt="pdf" className={styles.pdfLogo} />
                  <span className={styles.filename}>
                    {truncateFileName(file?.name)}
                  </span>
                </div>
              ) : (
                <figure className={styles.fileImageFigure}>
                  <img
                    src={fileThumbnail}
                    alt="img"
                    className={styles.fileImage}
                  />
                </figure>
              )}
            </div>
            <div className={styles.actonWrapper}>
              <Button label={'Send'} onClick={onSendFile} />
            </div>
          </div>
        </AppModal>
      )}

      {messageDelete && (
        <AppModal
          width={389}
          {...modalHandlers}
          disableClosingModal
          closeIcon={false}
        >
          <MessageDeleteModal
            setMessageDelete={setMessageDelete}
            onDelete={onDeleteChat}
          />
        </AppModal>
      )}

      {addThisClientShow && (
        <AppModal
          className={styles.modal2}
          width={1054}
          {...modalHandlers}
          withBorder={false}
        >
          <AddThisClientModal data={modalHandlers.metaData} />
        </AppModal>
      )}

      {messageMenu && messageMenu.visible && (
        <DeleteMessagePopup
          label={'Delete for everyone'}
          x={messageMenu.x}
          y={messageMenu.y}
          onDelete={() => onDeleteMessageEveryone(messageMenu?.messageId)}
        />
      )}
      {messageMenuOther && messageMenuOther.visible && (
        <DeleteMessagePopup
          label={'Delete for me'}
          x={messageMenuOther.x}
          y={messageMenuOther.y}
          onDelete={() => onDeleteMessage(messageMenuOther?.messageId)}
        />
      )}
      {messageMenuChat && messageMenuChat.visible && (
        <DeleteMessagePopup
          label={'Delete Chat'}
          x={messageMenuChat.x}
          y={messageMenuChat.y}
          onDelete={() =>
            deleteChat(
              messageMenuChat?.chatId,
              messageMenuChat?.agoraUsername,
              messageMenuChat?.agoraUsernameOther,
              messageMenuChat?.agoraToken,
            )
          }
        />
      )}
    </div>
  );
};
export default Chat;
