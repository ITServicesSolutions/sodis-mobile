import React, { useEffect } from "react";
import { StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { View, Text, useThemeColor } from "@/components/Themed"
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { getUserNetworkTree, selectNetwork, clearNetworkTree } from "@/store/networkSlice";
import Colors from "@/constants/Colors";
import { useTranslation } from "react-i18next";
import BackButton from "@/components/ui/BackButton";
import { FontAwesome } from '@expo/vector-icons';


interface NetworkNode {
  user_id: string;
  name: string;
  is_head?: boolean;
  generation?: number | null;
  position_in_generation?: number | null;
  children?: NetworkNode[];
}


interface NetworkScreenProps {
  user_id: string;
}

const NetworkScreen: React.FC<NetworkScreenProps> = ({ user_id }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const primaryColor = useThemeColor({}, "primary");
  const textColor = useThemeColor({}, "text");
  const bgColor = useThemeColor({}, "white");
  const borderColor = useThemeColor({}, 'border');

  const { networkTree, loading, error } = useSelector(selectNetwork);
  const { user } = useSelector((state: RootState) => state.auth);

useEffect(() => {
  if (user?.id) {
    dispatch(getUserNetworkTree(user.id));
  }
  return () => {
    dispatch(clearNetworkTree());
  };
}, [dispatch, user?.id]);

  // Fonction récursive avec visuel
  const renderNode = (node: NetworkNode, level: number = 0) => {
    return (
      <View key={node.user_id} style={{ marginLeft: level * 40, marginVertical: 10 }}>
        <View style={styles.nodeContainer}>
          {/* Cercle avec icône user */}
          <View style={[styles.circle, { backgroundColor: node.is_head ? 'green' : Colors.light.primary }]}>
            <FontAwesome name="user" size={16} color="#fff" />
          </View>

          {/* Nom */}
          <Text style={[styles.nodeText, {color: textColor}]}>
            {node.name}
          </Text>

          {/* Badge TDR si c'est un head */}
          {node.is_head && (
            <View style={styles.headBadge}>
              <Text style={styles.headBadgeText}>
                TDR
              </Text>
            </View>
          )}

          {/* Génération / position */}
          {(node.generation != null || node.position_in_generation != null) && (
            <View style={styles.genPosBadge}>
              <Text style={[styles.genPosText, {color: textColor}]}>
                G{node.generation ?? "-"} — P{node.position_in_generation ?? "-"}
              </Text>
            </View>
          )}
        </View>

        {/* Enfants */}
        {node.children && node.children.length > 0 && (
          <View style={{ marginLeft: 20, borderLeftWidth: 1, borderLeftColor: "#ccc", paddingLeft: 10 }}>
            {node.children.map((child) => (
              <React.Fragment key={`${child.user_id}-${child.generation}-${child.position_in_generation}`}>
                {renderNode(child, level + 1)}
              </React.Fragment>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (loading)
    return <ActivityIndicator size="large" color={primaryColor} style={{ marginTop: 50 }} />;
  if (error) return <Text style={styles.error}>{error}</Text>;
  if (!networkTree) {
    return (
      <View style={styles.container}>
        <BackButton />
        <Text style={[styles.title, {color: textColor}]}>
          {t("network.my_network")}
        </Text>
        <Text style={[styles.empty]}>
          {t("network.no_network")}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <BackButton />
        <View style={{ flex: 1, justifyContent: "space-between", padding: 20, paddingTop: 80, paddingBottom: 40 }}>
          {/* Contenu principal */}
          <View>
            <Text style={[styles.title, {color: textColor}]}>
              {t("network.my_network")}
            </Text>
            {renderNode(networkTree as NetworkNode)}
          </View>

          {/* Légende */}
          <View style={styles.legendContainer}>
            <Text style={[styles.legendTitle, {color: textColor}]}>
              {t("network.legende")}
            </Text>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.circle, { backgroundColor: 'green', width: 16, height: 16 }]} />
                <Text style={styles.legendText}>
                  {t("network.tdr")}
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.circle, { backgroundColor: '#ccc', width: 16, height: 16 }]} />
                <Text style={styles.legendText}>
                  {t("network.gxpx")}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScrollView>
  );
};

export default NetworkScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    color: Colors.light.primary,
    textAlign: "center",
  },
  nodeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headBadge: {
    backgroundColor: 'green',
    borderRadius: 4,
    paddingHorizontal: 4,
    marginLeft: 5,
  },
  headBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  genPosBadge: {
    backgroundColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 4,
    marginLeft: 5,
  },
  genPosText: {
    fontSize: 12,
    fontWeight: '500',
  },
  nodeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: 50,
  },
  empty: {
    color: "#a30909ff",
    textAlign: "center",
    marginTop: 100,
  },
  legendContainer: {
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  legendTitle: {
    fontWeight: '700',
    marginBottom: 5,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5,
  },
  legendText: {
    fontSize: 12,
    marginLeft: 4,
  },
});
