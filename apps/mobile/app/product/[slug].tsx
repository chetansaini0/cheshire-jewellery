import { useLocalSearchParams } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { seedProducts, productImage } from "@cheshire/database";
import { formatINR } from "@cheshire/utils";

export default function ProductScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const product = seedProducts.find((p) => p.slug === slug);

  if (!product) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Product not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F7F5F0" }}>
      <ScrollView>
        <Image
          source={{ uri: productImage(product.imageIds[0], 1000) }}
          style={{ width: "100%", aspectRatio: 4 / 5, backgroundColor: "#ebe7df" }}
        />
        <View style={{ padding: 20, paddingBottom: 120 }}>
          <Text style={{ fontSize: 32, fontFamily: "Georgia" }}>{product.name}</Text>
          <Text style={{ marginTop: 8, color: "#6B6B6B" }}>
            {product.rating} · {product.reviewCount} reviews
          </Text>
          <Text style={{ marginTop: 12, fontSize: 20 }}>{formatINR(product.price)}</Text>
          <Text style={{ marginTop: 16, color: "#6B6B6B", lineHeight: 22 }}>{product.description}</Text>
        </View>
      </ScrollView>
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: 16,
          backgroundColor: "#F7F5F0",
          borderTopWidth: 1,
          borderTopColor: "#E6E2DA",
        }}
      >
        <Pressable style={{ backgroundColor: "#111111", paddingVertical: 14, alignItems: "center" }}>
          <Text style={{ color: "#F7F5F0", letterSpacing: 2, fontSize: 11 }}>ADD TO CART</Text>
        </Pressable>
      </View>
    </View>
  );
}
