import { Text, View } from "react-native";

export default function AccountScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F7F5F0", paddingTop: 56, paddingHorizontal: 20 }}>
      <Text style={{ fontSize: 34, fontFamily: "Georgia" }}>Account</Text>
      <Text style={{ marginTop: 16, color: "#6B6B6B", lineHeight: 22 }}>
        OTP · Email · Google · Apple{"\n"}
        Orders · Rewards · Coupons · Addresses{"\n"}
        Notification preferences · Account deletion
      </Text>
    </View>
  );
}
