import { Text, View } from "react-native";

export default function WishlistScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F7F5F0", paddingTop: 56, paddingHorizontal: 20 }}>
      <Text style={{ fontSize: 34, fontFamily: "Georgia" }}>Wishlist</Text>
      <Text style={{ marginTop: 12, color: "#6B6B6B" }}>
        Wishlist syncs with web/account via API once authenticated.
      </Text>
    </View>
  );
}
