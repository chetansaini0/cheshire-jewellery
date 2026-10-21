import { Link } from "expo-router";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { seedProducts, productImage } from "@cheshire/database";
import { formatINR } from "@cheshire/utils";

export default function ShopScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F7F5F0", paddingTop: 56 }}>
      <Text style={{ paddingHorizontal: 20, fontSize: 34, fontFamily: "Georgia" }}>Shop</Text>
      <FlatList
        contentContainerStyle={{ padding: 20, gap: 16 }}
        data={seedProducts}
        keyExtractor={(item) => item.sku}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        renderItem={({ item }) => (
          <Link href={`/product/${item.slug}`} asChild>
            <Pressable style={{ flex: 1 }}>
              <Image
                source={{ uri: productImage(item.imageIds[0], 600) }}
                style={{ width: "100%", aspectRatio: 3 / 4, backgroundColor: "#ebe7df" }}
              />
              <Text style={{ marginTop: 8, fontSize: 12 }} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={{ marginTop: 4 }}>{formatINR(item.price)}</Text>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}
