
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Separate Footer Component
const Footer = ({ navigation, handleLogout, activeTab = 'Menu' }) => {
  return (
    <View style={footerStyles.container}>
      <TouchableOpacity
        style={footerStyles.button}
        onPress={() => navigation.navigate("Orders")}
      >
        <View style={[footerStyles.iconContainer, activeTab === 'Orders' && footerStyles.activeIcon]}>
          <Ionicons name="receipt-outline" size={24} color={activeTab === 'Orders' ? "#fff" : "#7c3aed"} />
        </View>
        <Text style={[footerStyles.buttonText, activeTab === 'Orders' && footerStyles.activeText]}>Orders</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={footerStyles.button}
        onPress={() => navigation.navigate("Menu")}
      >
        <View style={[footerStyles.iconContainer, activeTab === 'Menu' && footerStyles.activeIcon]}>
          <Ionicons name="restaurant-outline" size={24} color={activeTab === 'Menu' ? "#fff" : "#7c3aed"} />
        </View>
        <Text style={[footerStyles.buttonText, activeTab === 'Menu' && footerStyles.activeText]}>Menu</Text>
      </TouchableOpacity>

      <TouchableOpacity style={footerStyles.button} onPress={handleLogout}>
        <View style={footerStyles.iconContainer}>
          <Ionicons name="log-out-outline" size={24} color="#7c3aed" />
        </View>
        <Text style={footerStyles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Footer

const footerStyles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  button: {
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  activeIcon: {
    backgroundColor: "#7c3aed",
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7280",
  },
  activeText: {
    color: "#7c3aed",
    fontWeight: "600",
  },
});
