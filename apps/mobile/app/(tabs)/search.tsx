import { useMemo, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import { seedProducts } from "@cheshire/database/catalog";
import { formatINR } from "@cheshire/utils";

export default function SearchScreen() {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const query = q.toLowerCase();
    if (!query) return [];
    return seedProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.tags.some((t) => t.includes(query)) ||
        p.moods.some((m) => m.toLowerCase().includes(query))
    );
  }, [q]);

  return (
    <View style={{ flex: 1, backgroundColor: "#F7F5F0", paddingTop: 56, paddingHorizontal: 20 }}>
      <Text style={{ fontSize: 34, fontFamily: "Georgia" }}>Search</Text>
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="silver ring, gift under 2000..."
        placeholderTextColor="#B8B8B8"
        style={{
          marginTop: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#111111",
          paddingVertical: 12,
          fontSize: 18,
        }}
      />
      <FlatList
        style={{ marginTop: 20 }}
        data={results}
        keyExtractor={(item) => item.sku}
        ListEmptyComponent={
          <Text style={{ color: "#6B6B6B" }}>
            Try popular: minimal necklace, black jewellery, gift under 2000
          </Text>
        }
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#E6E2DA" }}>
            <Text>{item.name}</Text>
            <Text style={{ color: "#6B6B6B", marginTop: 4 }}>{formatINR(item.price)}</Text>
          </View>
        )}
      />
    </View>
  );
}
