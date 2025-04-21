import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import CallAnswerIcon from "@/assets/images/call-answer-icon.png";
import CallRejectIcon from "@/assets/images/call-decline-icon.png";
import CallPauseIcon from "@/assets/images/call-pause-icon.png";
import CallPauseIcon2 from "@/assets/images/call-pause-icon-2.png";

export default function CallComponent({
  isHangUp,
  buttonName,
  stationName,
  locationName,
  seconds,
  isPaused,
  handleCleanHangOutItem,
  handleStationVideoCallBack,
  handleJoinCall,
  handlePauseTimer,
  handleHangOut,
}: {
  isHangUp: boolean;
  buttonName: string;
  stationName: string;
  locationName: string;
  seconds: number;
  isPaused: boolean;
  handleCleanHangOutItem: () => void;
  handleStationVideoCallBack: () => void;
  handleJoinCall: () => void;
  handlePauseTimer: () => void;
  handleHangOut: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={isHangUp ? handleStationVideoCallBack : handleJoinCall}
    >
      <View style={isHangUp ? styles.hangupContainer : styles.container}>
        <View style={styles.iconsContainer}>
          <TouchableOpacity
            onPress={isHangUp ? handleStationVideoCallBack : handleJoinCall}
          >
            <Image
              style={styles.pickUpIcon}
              source={CallAnswerIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          {!isHangUp && (
            <TouchableOpacity onPress={handlePauseTimer}>
              <Image
                style={styles.pickUpIcon}
                source={isPaused ? CallPauseIcon2 : CallPauseIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={isHangUp ? handleCleanHangOutItem : handleHangOut}
          >
            <Image
              style={styles.pickUpIcon}
              source={CallRejectIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.buttonNameTitle}>{buttonName}</Text>
        <Text style={styles.description}>
          {stationName} - {locationName}
        </Text>
        <Text style={styles.description}>{seconds} seconds</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 30,
    borderLeftColor: "lightgreen",
    borderLeftWidth: 10,
    borderWidth: 1,
    borderRadius: 10,
    width: "100%",
    paddingTop: 5,
    paddingBottom: 20,
    paddingHorizontal: 20,
    marginBottom: 10,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  hangupContainer: {
    flex: 1,
    paddingVertical: 30,
    borderLeftColor: "red",
    borderLeftWidth: 10,
    borderWidth: 1,
    borderRadius: 10,
    width: "100%",
    paddingTop: 5,
    paddingBottom: 20,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  iconsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 5,
  },
  pickUpIcon: {
    width: 35,
    height: 35,
    borderRadius: 50,
  },
  buttonNameTitle: {
    fontSize: 20,
    color: "gray",
    fontWeight: "bold",
    letterSpacing: 2,
    marginTop: 5,
  },
  description: {
    fontSize: 15,
    color: "darkgray",
    fontWeight: "bold",
    letterSpacing: 1,
    marginTop: 5,
  },
});