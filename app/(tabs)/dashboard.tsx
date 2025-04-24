import React, { useEffect, useRef, useState, useCallback } from "react";
import { useFocusEffect } from '@react-navigation/native';
import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import LogoutGray from "@/assets/images/logout-gray.png";
import ToggleSwitch from "toggle-switch-react-native";
import CallComponent from "../../components/CallComponent";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { getMe } from "../../api";
import AnonymousImage from "@/assets/images/anonymous.png";
import _ from "lodash";
import { Audio } from "expo-av";
import moment from "moment-timezone";
import { database } from "../../firebaseConfig";
import { ref, get, onChildChanged, update, onChildAdded, remove, onValue } from "firebase/database";
import { useDispatch } from "react-redux";
import { callSlice } from "@/store/reducers/appReducer";

interface FirebaseCallObject {
    acsLink: string;
    callType: number;
    callTypeName: string;
    dwellingId: string;
    dwellingName: string;
    key: string;
    message: string;
    onHold: boolean;
    receptionist: string;
    selectedDepartments: string;
    selectedEmployees: string;
    showTermsAndConditions: boolean;
    startTime: number;
    stationCode: string;
    stationName: string;
    stationId: number;
    status: number;
    stayId: number;
    takeId: number;
    takeScreenshot: boolean;
    timerPause: boolean;
    waitTime: number;
    printerNamePdf: string;
}

enum ReceptionistRoleType {
    ADMIN = 1,
    RECEPTIONIST = 2,
}

export default function TabDashboardScreen() {
    const dispatch = useDispatch();

    const [isOnline, setIsOnline] = useState<boolean>(false);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [startSecondCounter, setStartSecondCounter] = useState<boolean>(false);
    const [IsEmailNotification, setIsEmailNotification] = useState<boolean>(false);

    const [userProfileImageUrl, setUserProfileImageUrl] = useState<string>("");
    const [userFirstName, setUserFirstName] = useState<string>("");
    const [userLastName, setUserLastName] = useState<string>("");
    const [userId, setUserId] = useState<string>("");
    const [ownerId, setOwnerId] = useState<string>("");
    const [userEmail, setUserEmail] = useState<string>("");
    const [userSelectedDepartments, setUserSelectedDepartments] = useState<string>("");
    const [userSelectedDwellings, setUserSelectedDwellings] = useState<string>("");

    const [queueArrayState, setQueueArrayState] = useState<FirebaseCallObject[]>(
        []
    );
    const [hangOutArrayState, setHangOutArrayState] = useState<
        FirebaseCallObject[]
    >([]);
    const [secondTimer, setSecondTimer] = useState<ReturnType<
        typeof setInterval
    > | null>(null);
    const [ringingInterval, setRingingInterval] = useState<ReturnType<
        typeof setInterval
    > | null>(null);
    const [receptionists, setReceptionists] = useState<any>([]);
    const [presenceInterval, setPresenceInterval] = useState<
        ReturnType<typeof setInterval> | null
    >(null);

    const queueArray = useRef<FirebaseCallObject[]>([]);
    const hangoutArray = useRef<FirebaseCallObject[]>([]);

    useFocusEffect(
        useCallback(() => {
            const checkToken = async () => {
                const token = await AsyncStorage.getItem("token");

                if (!token) {
                    router.push("/");
                }

                const data = await getMe();

                if (data.user) {
                    setUserId(data.user.Auth0Id ? data.user.Auth0Id : `${data.user.id}`);
                    setOwnerId(
                        data.user.Receptionists.length > 0
                            ? data.user.Receptionists[0].auth0Id
                                ? data.user.Receptionists[0].auth0Id
                                : `${data.user.Receptionists[0].id}`
                            : data.user.Auth0Id
                                ? data.user.Auth0Id
                                : `${data.user.id}`
                    );
                    setUserFirstName(data.user.FirstName);
                    setUserLastName(data.user.LastName);
                    setUserProfileImageUrl(data.user.image ? data.user.image.Url : "");
                    setIsAdmin(data.user.Receptionists.length > 0);
                    setReceptionists(data.user.Receptionists);
                    setIsEmailNotification(data.user.IsEmailNotification);
                    setUserEmail(data.user.Email);
                    setUserSelectedDepartments(
                        data.user.Receptionists.length > 0
                            ? data.user.Receptionists[0].SelectedDepartments
                            : null
                    );
                    setUserSelectedDwellings(
                        data.user.Receptionists.length > 0
                            ? data.user.Receptionists[0].SelectedDwellings
                            : null
                    );
                } else {
                    AsyncStorage.removeItem("token");
                    router.push("/");
                }
            };

            checkToken();
        }, [])
    );

    useEffect(() => {
        if (userId && ownerId) {
            const presenceRef = ref(
                database,
                `/presences/${ownerId}/${userId}`
            );

            get(presenceRef).then((snapshot) => {
                const data = snapshot.val();
                setIsOnline(data.offlineSelected ? false : true);
            });
        }
    }, [userId, ownerId]);

    const toggleOnlineStatus = async (isOn: boolean) => {
        setIsOnline(isOn);

        const presenceRef = ref(
            database,
            `/presences/${ownerId}/${userId}`
        );

        await update(presenceRef, {
            offlineSelected: isOn ? false : true,
        });
    };

    const handleLogOut = async () => {
        await AsyncStorage.removeItem("token");
        router.push("/");
    };

    const handleDepartmentCheck = (data: FirebaseCallObject) => {
        if (!!data.selectedDepartments) {
            if (!!receptionists[0].SelectedDepartments) {
                if (receptionists[0].SelectedDepartments.includes("|")) {
                    const userDeptArray = receptionists[0].SelectedDepartments.split("|");
                    const intersection = userDeptArray.filter((element: string) =>
                        data.selectedDepartments.includes(element)
                    );
                    if (intersection.length > 0) {
                        if (!_.isEmpty(intersection)) {
                            return true;
                        } else {
                            if (receptionists[0].SelectedDepartments.length > 0) {
                                if (intersection[0].trim().length > 0) return true;
                                else return false;
                            } else {
                                return true;
                            }
                        }
                    }
                } else {
                    if (data.selectedDepartments.includes("|")) {
                        const callDeptArray = data.selectedDepartments.split("|");
                        const intersection = callDeptArray.filter((element: string) =>
                            receptionists[0].SelectedDepartments!.includes(element)
                        );
                        if (!_.isEmpty(intersection)) {
                            return true;
                        }
                    } else {
                        if (
                            data.selectedDepartments === receptionists[0].SelectedDepartments
                        ) {
                            return true;
                        }
                    }
                }
            }
        } else if (
            receptionists[0].SelectedDepartments === null ||
            receptionists[0].SelectedDepartments === "" ||
            receptionists[0].SelectedDepartments.trim() === ""
        ) {
            return true;
        }
        return false;
    };

    useEffect(() => {
        if (!secondTimer && startSecondCounter) {
            setSecondTimer(
                setInterval(() => {
                    queueArray.current = queueArray.current.map((item) => {
                        return {
                            ...item,
                            waitTime: item.waitTime + 1,
                        };
                    });

                    setQueueArrayState(queueArray.current);

                    hangoutArray.current = hangoutArray.current.map((item) => {
                        return {
                            ...item,
                            waitTime: item.waitTime + 1,
                        };
                    });

                    const newHangOutArray = [...hangoutArray.current];
                    for (let i = 0; i < newHangOutArray.length; i++) {
                        if (newHangOutArray[i].waitTime > 60) {
                            newHangOutArray.splice(i, 1);
                            hangoutArray.current = newHangOutArray;
                        }
                    }

                    setHangOutArrayState(hangoutArray.current);
                }, 1000)
            );
        }

        return () => {
            if (secondTimer !== null) {
                clearInterval(secondTimer);
                setSecondTimer(null);
            }
        };
    }, [startSecondCounter]);

    useEffect(() => {
        if (
            queueArray.current.length < 1 &&
            hangoutArray.current.length < 1 &&
            secondTimer
        ) {
            clearInterval(secondTimer);
            setSecondTimer(null);
            setStartSecondCounter(false);
        }
    }, [queueArray.current, hangoutArray.current]);

    useEffect(() => {
        if (!ownerId) return;

        const incomingCallsRefChanged = ref(database, `/calls/${ownerId}`);

        onChildChanged(incomingCallsRefChanged, (data) => {
            const object = data.val();
            if (object.status === 1) {
                const newQueueArray = [...queueArray.current];
                object.key = data.key;
                object.waitTime = Math.round(
                    (new Date().getTime() - object.startTime) / 1000
                );
                newQueueArray.push(object);
                queueArray.current = newQueueArray;
                setQueueArrayState(queueArray.current);
            } else if (object.status === 2) {
                const newQueueArray = [...queueArray.current];
                object.key = data.key;
                object.waitTime = Math.round(
                    (new Date().getTime() - object.startTime) / 1000
                );
                newQueueArray.push(object);
                queueArray.current = newQueueArray;
                setQueueArrayState(queueArray.current);
            } else if (data.val().status === 3 || data.val().status === 5) {
                const newQueueArray = [...queueArray.current];
                const newHangOutArray = [...hangoutArray.current];
                if (data.val().status === 5) {
                    for (let i = 0; i < hangoutArray.current.length; i++) {
                        if (newHangOutArray[i].key === data.key) {
                            newHangOutArray.splice(i, 1);
                            hangoutArray.current = newHangOutArray;
                            setHangOutArrayState(newHangOutArray);
                            break;
                        }
                    }
                } else {
                    for (let i = 0; i < queueArray.current.length; i++) {
                        if (newQueueArray[i].key === data.key) {
                            newQueueArray[i].waitTime = 0;
                            newHangOutArray.push(newQueueArray[i]);
                            newQueueArray.splice(i, 1);
                            queueArray.current = newQueueArray;
                            hangoutArray.current = newHangOutArray;
                            setHangOutArrayState(newHangOutArray);
                            setQueueArrayState(newQueueArray);
                            break;
                        }
                    }
                }
            }
        });

        const incomingCallsRefAdded = ref(database, `/calls/${ownerId}`);

        onChildAdded(incomingCallsRefAdded, (data) => {
            const object = data.val();
            const newQueueArray = [...queueArray.current];
            object.key = data.key;
            object.waitTime = Math.round(
                (new Date().getTime() - object.startTime) / 1000
            );

            if (object.status === 1 && isOnline) {
                if (object.selectedEmployees && object.selectedEmployees.length > 0) {
                    if (object.selectedEmployees === userId) {
                        newQueueArray.push(object);
                    }
                } else {
                    if (
                        receptionists.length < 1 ||
                        (receptionists[0].Role === ReceptionistRoleType.ADMIN &&
                            receptionists[0].SelectedDepartments === null)
                    ) {
                        if (!object.selectedDepartments) {
                            newQueueArray.push(object);
                        }
                    } else {
                        if (!!receptionists[0].SelectedDwellings) {
                            const selectedArray =
                                receptionists[0].SelectedDwellings.split("|");
                            if (selectedArray.includes(object.dwellingId)) {
                                if (handleDepartmentCheck(object)) {
                                    newQueueArray.push(object);
                                }
                            }
                        } else {
                            if (handleDepartmentCheck(object)) {
                                newQueueArray.push(object);
                            }
                        }
                    }
                }
            }

            const uniqueArray = newQueueArray.filter(
                (thing, index, self) =>
                    index === self.findIndex((t) => t.key === thing.key)
            );

            queueArray.current = uniqueArray;
            setQueueArrayState(queueArray.current);
            setStartSecondCounter(true);
        });
    }, [ownerId, isOnline]);

    useEffect(() => {
        const asyncFunction = async () => {
            if (queueArray.current.length > 0) {
                let isPaused = false;
                for (let i = 0; i < queueArray.current.length; i++) {
                    if (queueArray.current[i].timerPause) {
                        isPaused = true;
                    } else if (isPaused) {
                        isPaused = false;
                    }
                }
                if (!ringingInterval) {
                    if (!isPaused) {
                        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

                        const { sound: playbackObject } = await Audio.Sound.createAsync(
                            {
                                uri: "https://app.virtualfrontdesk.com/sound/notif_sustain.mp3",
                            },
                            { shouldPlay: true }
                        );

                        await playbackObject.setVolumeAsync(1.0);

                        await playbackObject.playAsync();

                        setRingingInterval(
                            setInterval(async () => {
                                await playbackObject.replayAsync();
                            }, 4000)
                        );
                    }
                } else if (isPaused) {
                    clearInterval(ringingInterval);
                    setRingingInterval(null);
                }
            } else {
                if (ringingInterval) {
                    clearInterval(ringingInterval);
                    setRingingInterval(null);
                }
            }
        };

        asyncFunction();
    }, [queueArray.current, ringingInterval]);

    useEffect(() => {
        if (!userId || !ownerId) return;

        const asyncCheck = async () => {
            let queryPresence: ReturnType<typeof ref>;
            if (receptionists && receptionists.length > 0) {
                queryPresence = ref(
                    database,
                    `presences/${ownerId}/${userId}`
                );
            } else {
                const queryCalls = ref(database, `calls/${ownerId}`);

                onValue(queryCalls, (snapshot) => {
                    snapshot.forEach((childSnapshot) => {
                        const time = childSnapshot.val().startTime;
                        const now = new Date().getTime();
                        const diff = now - time;
                        const days = diff / (1000 * 60 * 60 * 24);
                        if (days > 3) {
                            remove(ref(database, `calls/${ownerId}/${childSnapshot.key}`));
                        }
                    });
                });

                queryPresence = ref(
                    database,
                    `presences/${ownerId}/${userId}`
                );
            }

            if (!presenceInterval) {
                setPresenceInterval(
                    setInterval(async () => {
                        update(queryPresence, {
                            firstName: userFirstName,
                            lastName: userLastName,
                            profilImg: userProfileImageUrl || null,
                            selectedDwellings:
                                userSelectedDwellings,
                            selectedDepartments:
                                userSelectedDepartments,
                            id: userId,
                            lastSeen: moment(new Date().getTime()).tz("America/New_York").valueOf(),
                            emailNotification: IsEmailNotification ? userEmail : null,
                        });
                    }, 30000)
                );
            }

            update(queryPresence, {
                firstName: userFirstName,
                lastName: userLastName,
                profilImg: userProfileImageUrl || null,
                selectedDwellings: userSelectedDwellings,
                selectedDepartments: userSelectedDepartments,
                id: userId,
                lastSeen: moment(new Date().getTime()).tz("America/New_York").valueOf(),
                emailNotification: IsEmailNotification ? userEmail : null,
            });
        };
        asyncCheck();

        return () => {
            if (presenceInterval !== null) {
                clearInterval(presenceInterval);
            }
        };
    }, [ownerId, userId]);

    /*useEffect(() => {
      if (queueArray.current.length > 0 || hangoutArray.current.length > 0) {
        let incomingCall = false;
        for (let i = 0; i < queueArray.current.length; i++) {
          if (queueArray.current[i].status === 1) {
            incomingCall = true;
            break;
          }
        }
  
        if (!incomingCall) {
          for (let i = 0; i < hangoutArray.current.length; i++) {
            if (hangoutArray.current[i].status === 1) {
              incomingCall = true;
              break;
            }
          }
        }
  
        if (incomingCall) {
          dispatch(callSlice.actions.setHasIncomingCall(true));
        } else {
          dispatch(callSlice.actions.setHasIncomingCall(true));
        }
      } else {
        dispatch(callSlice.actions.setHasIncomingCall(true));
      }
    }, [queueArray.current, hangoutArray.current]);*/

    const handlePauseTimer = (key: string) => {
        if (!ownerId) return;

        const callRef = ref(database, `/calls/${ownerId}/${key}`);

        update(callRef, {
            timerPause: true,
        });
    };

    const handleHangOut = (key: string) => {
        if (!ownerId) return;

        const callRef = ref(database, `/calls/${ownerId}/${key}`);

        update(callRef, {
            status: 3,
        });
    };

    const handleJoinCall = (data: FirebaseCallObject) => {
        if (!ownerId) return;

        const receptionist = userFirstName + " " + userLastName;

        const callRef = ref(database, `/calls/${ownerId}/${data.key}`);

        update(callRef, {
            status: 2,
            receptionist: receptionist,
        });


        dispatch(
            callSlice.actions.setCallData({
                callKey: data.key,
                dwellingId: data.dwellingId,
                callLink: data.acsLink,
                stayId: `${data.stayId}`,
                dwellingName: data.dwellingName,
                stationName: data.stationName,
                stationCode: data.stationCode,
                printerName: data.printerNamePdf,
                stationId: data.stationId,
            })
        );

        // @ts-ignore
        router.push("/call");
    };

    const handleCleanHangOutItem = (data: FirebaseCallObject) => {
        const newHangOutArray = [...hangoutArray.current];
        for (let i = 0; i < newHangOutArray.length; i++) {
            if (newHangOutArray[i].key === data.key) {
                newHangOutArray.splice(i, 1);
                hangoutArray.current = newHangOutArray;
                setHangOutArrayState(newHangOutArray);
            }
        }
    };

    const handleStationVideoCallBack = (item: FirebaseCallObject) => {
        if (!ownerId) return;

        const callRef = ref(database, `/calls/${ownerId}/${item.key}`);
        update(callRef, {
            status: 5,
        });

        handleJoinCall(item);
    };

    return (
        <View style={styles.container}>
            <View style={styles.topContainer}>
                <View style={styles.profileImageContainer}>
                    <Image
                        style={{ width: 60, height: 60, borderRadius: 150 / 2 }}
                        source={
                            userProfileImageUrl
                                ? {
                                    uri: userProfileImageUrl,
                                }
                                : AnonymousImage
                        }
                        resizeMode="cover"
                    />
                    <Text style={styles.profileText}>
                        {userFirstName} {userLastName} {isAdmin ? "(Admin)" : ""}
                    </Text>
                </View>
                <TouchableOpacity onPress={handleLogOut}>
                    <Image
                        source={LogoutGray}
                        style={styles.logoutIcon}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            </View>

            <Text style={styles.waitingListText}>Waiting list</Text>

            <View style={styles.statusContainer}>
                <View>
                    <Text style={styles.statusText}>Status</Text>
                    <Text style={styles.statusActualText}>
                        {isOnline ? "Online" : "Offline"}
                    </Text>
                </View>
                <ToggleSwitch
                    isOn={isOnline}
                    onColor="green"
                    offColor="red"
                    labelStyle={{ color: "black", fontWeight: "900" }}
                    size="large"
                    onToggle={(isOn) => toggleOnlineStatus(isOn)}
                />
            </View>

            <Text style={styles.waitingListText}>Calls</Text>

            <ScrollView style={{ width: "100%", marginTop: 20 }}>
                {queueArrayState.length > 0 ? (
                    queueArrayState.map((item, index) => (
                        <CallComponent
                            key={index}
                            isHangUp={false}
                            buttonName={item.callTypeName}
                            stationName={item.stationName}
                            locationName={item.dwellingName}
                            seconds={item.waitTime < 0 ? 0 : item.waitTime}
                            handleCleanHangOutItem={() => handleCleanHangOutItem(item)}
                            handleStationVideoCallBack={() =>
                                handleStationVideoCallBack(item)
                            }
                            handleJoinCall={() => handleJoinCall(item)}
                            handlePauseTimer={() => handlePauseTimer(item.key)}
                            handleHangOut={() => handleHangOut(item.key)}
                            isPaused={item.timerPause}
                        />
                    ))
                ) : (
                    <Text></Text>
                )}
                {hangOutArrayState.length > 0 ? (
                    hangOutArrayState.map((item, index) => (
                        <CallComponent
                            key={index}
                            isHangUp={true}
                            buttonName={"Missed call"}
                            stationName={item.stationName}
                            locationName={item.dwellingName}
                            seconds={item.waitTime < 0 ? 0 : item.waitTime}
                            handleCleanHangOutItem={() => handleCleanHangOutItem(item)}
                            handleStationVideoCallBack={() =>
                                handleStationVideoCallBack(item)
                            }
                            handleJoinCall={() => handleJoinCall(item)}
                            handlePauseTimer={() => handlePauseTimer(item.key)}
                            handleHangOut={() => handleHangOut(item.key)}
                            isPaused={item.timerPause}
                        />
                    ))
                ) : (
                    <Text></Text>
                )}

                {queueArrayState.length < 1 && hangOutArrayState.length < 1 && (
                    <Text style={styles.textNoCalls}>No calls</Text>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "flex-start",
        backgroundColor: "#fff",
        paddingHorizontal: 30,
    },
    topContainer: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 20,
    },
    profileImageContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    logoutIcon: {
        width: 30,
        height: 30,
    },
    profileText: {
        fontSize: 20,
        marginLeft: 10,
        color: "gray",
    },
    waitingListText: {
        fontSize: 30,
        color: "black",
        fontWeight: "bold",
        letterSpacing: 1,
        marginTop: 20,
    },
    statusContainer: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
        justifyContent: "space-between",
    },
    statusText: {
        fontSize: 20,
        color: "black",
        fontWeight: "bold",
    },
    statusActualText: {
        fontSize: 20,
        color: "gray",
    },
    textNoCalls: {
        fontSize: 20,
        color: "gray",
        textAlign: "center",
    },
});