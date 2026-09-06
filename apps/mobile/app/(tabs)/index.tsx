import { Link } from "expo-router";
import { ScrollView, Text, View, Pressable, Image } from "react-native";
import { seedProducts, productImage } from "@cheshire/database/catalog";
import { formatINR } from "@cheshire/utils";
import { moods } from "@cheshire/config";

export default function HomeScreen() {
  const drops = seedProducts.slice(0, 6);
  const bestsellers = seedProducts.filter((p) => p.isBestseller).slice(0, 6);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#F7F5F0" }}>
      <View style={{ paddingTop: 56, paddingHorizontal: 20 }}>
        <Text style={{ letterSpacing: 6, fontSize: 22 }}>CHESHIRE</Text>
        <Text style={{ marginTop: 28, fontSize: 40, lineHeight: 44, fontFamily: "Georgia" }}>
          WEAR YOUR STORY.
        </Text>
        <Text style={{ marginTop: 12, color: "#6B6B6B", fontSize: 14, lineHeight: 20 }}>
          Jewellery designed for the moments that become memories.
        </Text>
        <Link href="/(tabs)/shop" asChild>
          <Pressable
            style={{
              marginTop: 20,
              alignSelf: "flex-start",
              backgroundColor: "#111111",
              paddingHorizontal: 20,
              paddingVertical: 12,
            }}
          >
            <Text style={{ color: "#F7F5F0", letterSpacing: 2, fontSize: 11 }}>SHOP NEW</Text>
          </Pressable>
        </Link>
      </View>

      <Section title="JUST DROPPED.">
        <ProductRail products={drops} />
      </Section>

      <Section title="Shop by mood">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 20 }}>
          {moods.map((m) => (
            <View
              key={m.slug}
              style={{ borderWidth: 1, borderColor: "#E6E2DA", paddingHorizontal: 12, paddingVertical: 10 }}
            >
              <Text style={{ fontSize: 11, letterSpacing: 1.5 }}>{m.name}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="THE ONES EVERYONE WANTS.">
        <ProductRail products={bestsellers} />
      </Section>

      <Link href="/stylist" asChild>
        <Pressable style={{ margin: 20, backgroundColor: "#111111", padding: 24 }}>
          <Text style={{ color: "#B8B8B8", fontSize: 11, letterSpacing: 2 }}>STYLIST</Text>
          <Text style={{ color: "#F7F5F0", marginTop: 8, fontSize: 28, fontFamily: "Georgia" }}>
            CHESHIRE STYLIST
          </Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 36 }}>
      <Text style={{ paddingHorizontal: 20, fontSize: 28, fontFamily: "Georgia" }}>{title}</Text>
      <View style={{ marginTop: 16 }}>{children}</View>
    </View>
  );
}

function ProductRail({ products }: { products: typeof seedProducts }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
      {products.map((p) => (
        <Link key={p.sku} href={`/product/${p.slug}`} asChild>
          <Pressable style={{ width: 180 }}>
            <Image
              source={{ uri: productImage(p.imageIds[0], 600) }}
              style={{ width: 180, height: 230, backgroundColor: "#ebe7df" }}
            />
            <Text style={{ marginTop: 8, fontSize: 13 }} numberOfLines={2}>
              {p.name}
            </Text>
            <Text style={{ marginTop: 4, fontSize: 13 }}>{formatINR(p.price)}</Text>
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}
