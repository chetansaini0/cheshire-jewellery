import { useState } from "react";
import { Pressable, Text, View } from "react-native";

const occasions = ["EVERYDAY", "DATE NIGHT", "PARTY", "OFFICE", "WEDDING", "GIFT"];

export default function StylistScreen() {
  const [selected, setSelected] = useState("EVERYDAY");
  return (
    <View style={{ flex: 1, backgroundColor: "#F7F5F0", paddingTop: 56, paddingHorizontal: 20 }}>
      <Text style={{ fontSize: 34, fontFamily: "Georgia" }}>CHESHIRE STYLIST</Text>
      <Text style={{ marginTop: 12, color: "#6B6B6B" }}>What are you shopping for?</Text>
      <View style={{ marginTop: 20, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {occasions.map((o) => (
          <Pressable
            key={o}
            onPress={() => setSelected(o)}
            style={{
              borderWidth: 1,
              borderColor: selected === o ? "#111111" : "#E6E2DA",
              backgroundColor: selected === o ? "#111111" : "transparent",
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          >
            <Text style={{ color: selected === o ? "#F7F5F0" : "#111111", fontSize: 11, letterSpacing: 1 }}>
              {o}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
