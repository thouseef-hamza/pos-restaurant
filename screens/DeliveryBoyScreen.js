import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  StatusBar,
  ScrollView,
  Platform,
  Button,
  Modal,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Picker } from "@react-native-picker/picker";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { OrderAPI, AuthAPI, UserAPI } from "../api/api";
import { useRoute } from "@react-navigation/native";
// Main Dashboard Screen
const DeliveryDashboardScreen = ({ navigation }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [showAllStats, setShowAllStats] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  useEffect(() => {
    fetchDeliveryOrders();
  }, []);

  const fetchDeliveryOrders = async () => {
    try {
      const response = await OrderAPI.getDeliveryOrders();
      setStats(response);
    } catch (error) {
      Alert.alert("Error", "Failed to load orders: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AuthAPI.logout();
      navigation.replace("Login");
    } catch (error) {
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDeliveryOrders();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7e4bcc" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.brandingSection}>
        <View style={styles.brandingContainer}>
          <Image
            source={require("../assets/nasscript_logo.png")}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <Text style={styles.brandText}>NasResto</Text>
        </View>
        <View style={styles.brandingDivider} />
      </View>

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.welcome}>Welcome back,</Text>
          </View>
          <TouchableOpacity
            onPress={onRefresh}
            style={styles.refreshButton}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color="#7e4bcc" />
            ) : (
              <MaterialIcons name="refresh" size={24} color="#7e4bcc" />
            )}
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.qrRow}>
        <TouchableOpacity
          style={styles.qrButton}
          onPress={() => setIsScanning(true)}
        >
          <MaterialIcons name="qr-code-scanner" size={32} color="white" />
          <Text style={styles.qrButtonText}>Scan Order QR Code</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.statsHeading}>Overview</Text>

      <View style={styles.statsRow}>
        {stats?.total_orders != null && (
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Orders</Text>
            <Text style={styles.statValue}>{stats.total_orders}</Text>
          </View>
        )}
        {stats?.current_order != null && (
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Today's Orders</Text>
            <Text style={styles.statValue}>{stats.current_order}</Text>
          </View>
        )}
      </View>
      <View style={styles.statsRow}>
        {stats?.collected_total != null && (
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Payments Collected</Text>
            <Text style={styles.statValue}>{stats.collected_total}</Text>
          </View>
        )}
        {stats?.remaining_total != null && (
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Payments Pending</Text>
            <Text style={styles.statValue}>{stats.remaining_total}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.viewMoreButton}
        onPress={() => setShowAllStats(true)}
      >
        <Text style={styles.viewMoreText}>View More Stats</Text>
      </TouchableOpacity>

      <Modal visible={showAllStats} animationType="slide">
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={styles.statsHeading}>All Stats</Text>

          <View style={styles.statsGrid}>
            {/* {stats?.collected_total != null && (
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Payments Collected</Text>
                <Text style={styles.statValue}>{stats.collected_total}</Text>
              </View>
            )}
            {stats?.remaining_total != null && (
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Payments Pending</Text>
                <Text style={styles.statValue}>{stats.remaining_total}</Text>
              </View>
            )} */}
            {stats?.collected_today != null && (
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Collected Today</Text>
                <Text style={styles.statValue}>{stats.collected_today}</Text>
              </View>
            )}
            {stats?.remaining_today != null && (
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Pending Today</Text>
                <Text style={styles.statValue}>{stats.remaining_today}</Text>
              </View>
            )}
            {stats?.totals?.overall?.total_amount != null && (
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Overall Amount</Text>
                <Text style={styles.statValue}>
                  {stats.totals.overall.total_amount}
                </Text>
              </View>
            )}
            {stats?.totals?.overall?.total_collected != null && (
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Overall Collected</Text>
                <Text style={styles.statValue}>
                  {stats.totals.overall.total_collected}
                </Text>
              </View>
            )}
            {stats?.totals?.overall?.total_remaining != null && (
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Overall Pending</Text>
                <Text style={styles.statValue}>
                  {stats.totals.overall.total_remaining}
                </Text>
              </View>
            )}
            {stats?.totals?.overall?.delivered_count != null && (
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Delivered Orders</Text>
                <Text style={styles.statValue}>
                  {stats.totals.overall.delivered_count}
                </Text>
              </View>
            )}
            {stats?.totals?.overall?.undelivered_count != null && (
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Undelivered Orders</Text>
                <Text style={styles.statValue}>
                  {stats.totals.overall.undelivered_count}
                </Text>
              </View>
            )}
            {stats?.totals?.today?.total_amount != null && (
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Today's Amount</Text>
                <Text style={styles.statValue}>
                  {stats.totals.today.total_amount}
                </Text>
              </View>
            )}
            {stats?.totals?.today?.total_collected != null && (
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Today Collected</Text>
                <Text style={styles.statValue}>
                  {stats.totals.today.total_collected}
                </Text>
              </View>
            )}
            {stats?.totals?.today?.total_remaining != null && (
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Today Pending</Text>
                <Text style={styles.statValue}>
                  {stats.totals.today.total_remaining}
                </Text>
              </View>
            )}
            {stats?.totals?.today?.delivered_count != null && (
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Today Delivered</Text>
                <Text style={styles.statValue}>
                  {stats.totals.today.delivered_count}
                </Text>
              </View>
            )}
            {stats?.totals?.today?.undelivered_count != null && (
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Today Undelivered</Text>
                <Text style={styles.statValue}>
                  {stats.totals.today.undelivered_count}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.closeButtonModal}
            onPress={() => setShowAllStats(false)}
          >
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>

      <TouchableOpacity
        style={styles.ordersButton}
        onPress={() => navigation.navigate("OrdersScreen")}
      >
        <Text style={styles.ordersButtonText}>Your Orders</Text>
        <Ionicons name="arrow-forward" size={24} color="white" />
      </TouchableOpacity>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={24} color="#6C63FF" />
          <Text style={styles.footerButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* QR Scanner Modal */}
      {isScanning && (
        <QRScannerModal
          isVisible={isScanning}
          onClose={() => setIsScanning(false)}
          onRefresh={fetchDeliveryOrders}
        />
      )}
    </View>
  );
};

// Orders Screen
const OrdersScreen = ({ navigation }) => {
    const route = useRoute();

  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("assigned");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("cash");
  const [currentPaymentOrder, setCurrentPaymentOrder] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDeliveryOrders();
    setRefreshing(false);
  };

 useEffect(() => {
    if (route.params?.activeTab) {
      setActiveTab(route.params.activeTab);
    }
  }, [route.params?.activeTab]);

  useEffect(() => {
    fetchDeliveryOrders();
  }, []);

  useEffect(() => {
    if (selectedPayment === "credit" && !currentPaymentOrder?.customer) {
      const fetchCustomers = async () => {
        try {
          const data = await UserAPI.getCustomers();
          setCustomers(data || []);
        } catch (error) {
          console.error("Failed to fetch customers:", error);
        }
      };
      fetchCustomers();
    }
  }, [selectedPayment, currentPaymentOrder]);

  const fetchDeliveryOrders = async () => {
    try {
      const response = await OrderAPI.getDeliveryOrders();
      setOrders(response?.orders || []);
    } catch (error) {
      Alert.alert("Error", "Failed to load orders: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (activeTab === "assigned") return order.status === "assigned";
      if (activeTab === "picked") return order.status === "picked_up";
      if (activeTab === "delivered") return order.status === "delivered";
      return true;
    });
  }, [orders, activeTab]);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState("success"); // "success" | "error"
  const [alertMessage, setAlertMessage] = useState("");

  const confirmPayment = async () => {
    if (!currentPaymentOrder) return;

    const customerId = currentPaymentOrder.customer
      ? currentPaymentOrder.customer.id
      : selectedCustomer;

    if (selectedPayment === "credit" && !customerId) {
      setAlertType("error");
      setAlertMessage("Please select a customer for credit payment");
      setAlertVisible(true);
      return;
    }

    try {
      const payload = {
        order_status: "settled",
        payment_amount: currentPaymentOrder.amount,
        payment_type: selectedPayment,
      };

      if (selectedPayment === "credit") {
        payload.customer_id = customerId;
      }

      await OrderAPI.updateOrder(currentPaymentOrder.id, payload);

      setOrders(
        orders.map((order) =>
          order.id === currentPaymentOrder.id
            ? {
                ...order,
                status: "settled",
                order: { ...order.order, is_paid: true },
              }
            : order
        )
      );

      setShowPaymentModal(false);
      setCurrentPaymentOrder(null);

      setAlertType("success");
      setAlertMessage("Order has been settled successfully");
      setAlertVisible(true);
    } catch (error) {
      setAlertType("error");
      setAlertMessage(error.message || "Failed to settle order");
      setAlertVisible(true);
      console.error(error);
    }
  };

  const renderOrderItem = ({ item }) => {
    const order = item?.order || {};
    const orderNumber = order?.order_number || `#${item?.id}`;
    const status = item?.status || "unknown";
    const pickupTime = item?.pickup_time
      ? new Date(item.pickup_time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A";
    const paidStatus = order.is_paid ? "Paid" : "Unpaid";

    return (
      <TouchableOpacity
        style={[
          styles.orderItem,
          status === "delivered" ? styles.completedOrder : styles.pendingOrder,
        ]}
        onPress={() => setSelectedOrder(item)}
      >
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>{orderNumber}</Text>
          <View
            style={[
              styles.statusBadge,
              status === "delivered"
                ? styles.completedBadge
                : styles.pendingBadge,
            ]}
          >
            <Text style={styles.statusText}>
              {status
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </Text>
          </View>
        </View>

        <View style={styles.orderInfo}>
          <Ionicons name="cash" size={16} color="#555" />
          <Text style={styles.orderText}>
            QAR {order?.price || "0.00"} - {paidStatus}
          </Text>
        </View>

        <View style={styles.orderInfo}>
          <Ionicons name="time" size={16} color="#555" />
          <Text style={styles.orderText}>Pickup: {pickupTime}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7e4bcc" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.brandingSection}>
        <View style={styles.brandingContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={[styles.brandText, { marginLeft: 10, flex: 1 }]}>
            Your Orders
          </Text>
          <TouchableOpacity
            onPress={onRefresh}
            style={styles.refreshButton}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color="#7e4bcc" />
            ) : (
              <MaterialIcons name="refresh" size={24} color="#7e4bcc" />
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.brandingDivider} />
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "assigned" && styles.activeTab]}
          onPress={() => setActiveTab("assigned")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "assigned" && styles.activeTabText,
            ]}
          >
            Assigned
          </Text>
          {activeTab === "assigned" && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "picked" && styles.activeTab]}
          onPress={() => setActiveTab("picked")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "picked" && styles.activeTabText,
            ]}
          >
            Picked Up
          </Text>
          {activeTab === "picked" && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "delivered" && styles.activeTab]}
          onPress={() => setActiveTab("delivered")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "delivered" && styles.activeTabText,
            ]}
          >
            Delivered
          </Text>
          {activeTab === "delivered" && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>

      {filteredOrders.length > 0 ? (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: 70 }]}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="assignment" size={50} color="#ccc" />
          <Text style={styles.emptyText}>No {activeTab} orders found</Text>
        </View>
      )}

      <Modal
        visible={!!selectedOrder}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedOrder(null)}
      >
        <OrderDetailsModal
          selectedOrder={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSettlePayment={(order) => {
            setCurrentPaymentOrder({
              id: order.order.id,
              orderNumber: order.order.order_number,
              amount: order.order.price,
              customer: order.order.customer,
            });
            setSelectedOrder(null);
            setShowPaymentModal(true);
          }}
        />
      </Modal>

      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowPaymentModal(false);
          setCurrentPaymentOrder(null);
        }}
      >
        <PaymentModal
          currentPaymentOrder={currentPaymentOrder}
          selectedPayment={selectedPayment}
          setSelectedPayment={setSelectedPayment}
          customers={customers}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          onConfirm={confirmPayment}
          onClose={() => {
            setShowPaymentModal(false);
            setCurrentPaymentOrder(null);
          }}
        />
      </Modal>
      <Modal visible={alertVisible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              width: 260,
              backgroundColor: "white",
              borderRadius: 10,
              padding: 20,
              alignItems: "center",
            }}
          >
            <Ionicons
              name={
                alertType === "success" ? "checkmark-circle" : "close-circle"
              }
              size={60}
              color={alertType === "success" ? "green" : "red"}
            />
            <Text style={{ fontSize: 16, marginTop: 10, textAlign: "center" }}>
              {alertMessage}
            </Text>
            <TouchableOpacity
              style={{
                marginTop: 15,
                backgroundColor:
                  alertType === "success" ? "#7e4bcc" : "#d9534f",
                paddingHorizontal: 25,
                paddingVertical: 8,
                borderRadius: 6,
              }}
              onPress={() => {
                setAlertVisible(false);
                if (alertType === "success") {
                  setActiveTab("delivered");
                  fetchDeliveryOrders();
                }
              }}
            >
              <Text style={{ color: "white", fontSize: 16 }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// QR Scanner Modal Component
const QRScannerModal = ({ isVisible, onClose, onRefresh, }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState("back");
  const [scanResult, setScanResult] = useState(null);
  const [showScanResult, setShowScanResult] = useState(false);
  const cameraRef = useRef(null);
const isScanningRef = useRef(false);
  const navigation = useNavigation();

const handleBarCodeScanned = async ({ data }) => {
  if (!cameraReady || isScanningRef.current) return;

  isScanningRef.current = true;
  setCameraReady(false);

  try {
    setScanResult({
      loading: true,
      message: "Verifying QR code...",
    });
    setShowScanResult(true);

    const response = await OrderAPI.verifyQRCode(data);

    if (response === "Order Picked Successfully") {
      setScanResult({
        success: true,
        message: response,
      });
      onRefresh();
    } else if (response === "Order already picked by you") {
      setScanResult({
        success: false,
        message: response,
        warning: true,
      });
    } else {
      setScanResult({
        success: false,
        message: response || "QR verification failed",
        error: true,
      });
    }
  } catch (error) {
    setScanResult({
      success: false,
      message: error.message || "Failed to verify QR code",
      error: true,
    });
  } finally {
    setShowScanResult(true);
    // Reset after a delay to prevent immediate re-scan
    setTimeout(() => {
      isScanningRef.current = false;
    }, 5000);
  }
};

  const ScanResultPopup = () => (
    <Modal
      visible={showScanResult}
      transparent
      animationType="fade"
      onRequestClose={() => setShowScanResult(false)}
    >
      <View style={styles.popupBackdrop}>
        <View style={styles.popupCard}>
          <Text style={styles.popupTitle}>
            {scanResult?.loading
              ? "Processing..."
              : scanResult?.success
              ? "Success"
              : "Error"}
          </Text>

          <View
            style={[
              styles.dataBox,
              scanResult?.success && styles.successBox,
              scanResult?.error && styles.errorBox,
            ]}
          >
            {scanResult?.loading ? (
              <ActivityIndicator size="large" color="#3498db" />
            ) : (
              <Text style={styles.dataText}>{scanResult?.message}</Text>
            )}
          </View>

          {!scanResult?.loading && (
            <TouchableOpacity
              style={[
                styles.closeButton,
                scanResult?.success && styles.successButton,
                scanResult?.error && styles.errorButton,
              ]}
              onPress={() => {
  setShowScanResult(false);
  onClose();
  if (scanResult?.success) {
    navigation.navigate("OrdersScreen", { activeTab: "picked" });
  }
}}

  
            >
              <Text style={styles.buttonText}>
                {scanResult?.success ? "View Order" : "Close"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );

  if (!isVisible) return null;

  if (!permission) {
    return <View />;
  }
if (!isVisible) return null;

if (!permission) {
  return null; // still loading permission state
}

if (!permission.granted) {
  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          We need your permission to use the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
        <TouchableOpacity
          style={styles.closePermissionButton}
          onPress={onClose}
        >
          <Text style={styles.closePermissionText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

  return (
    <Modal visible={isVisible} transparent={false} animationType="slide">
      <View style={[styles.cameraContainer, styles.paddedContainer]}>
        <StatusBar barStyle="light-content" />
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          onBarcodeScanned={cameraReady ? handleBarCodeScanned : undefined}
          onCameraReady={() => setCameraReady(true)}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        >
          <View style={styles.scanOverlay}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
            <Text style={styles.scanText}>Align QR code within the frame</Text>
          </View>
        </CameraView>
        <TouchableOpacity
          style={[styles.closeButton, styles.paddedCloseButton]}
          onPress={onClose}
        >
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>
        <ScanResultPopup />
      </View>
    </Modal>
  );
};

// Order Details Modal Component
const OrderDetailsModal = ({ selectedOrder, onClose, onSettlePayment }) => {
  if (!selectedOrder) return null;

  return (
    <View style={styles.modalContainerOne}>
      <View style={styles.modalContentOne}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentOne}
        >
          <View style={styles.modalHeaderOne}>
            <Text style={styles.modalTitleOne}>
              Order{" "}
              {selectedOrder?.order?.order_number || `#${selectedOrder?.id}`}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#7e4bcc" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalSectionOne}>
            <Text style={styles.sectionTitleOne}>Payment Information</Text>
            <View style={styles.infoRowOne}>
              <Text style={styles.infoLabelOne}>Amount:</Text>
              <Text style={styles.infoValueOne}>
                QAR {selectedOrder?.order?.price || "0.00"}
              </Text>
            </View>
            <View style={styles.infoRowOne}>
              <Text style={styles.infoLabelOne}>Payment Status:</Text>
              <Text
                style={[
                  styles.infoValueOne,
                  selectedOrder?.order?.is_paid
                    ? styles.paidStatusOne
                    : styles.unpaidStatusOne,
                ]}
              >
                {selectedOrder?.order?.is_paid ? "Paid" : "Unpaid"}
              </Text>
            </View>
          </View>

          <View style={styles.modalSectionOne}>
            <Text style={styles.sectionTitleOne}>Timing</Text>
            <View style={styles.infoRowOne}>
              <Text style={styles.infoLabelOne}>Pickup Time:</Text>
              <Text style={styles.infoValueOne}>
                {selectedOrder?.pickup_time
                  ? new Date(selectedOrder.pickup_time).toLocaleString()
                  : "N/A"}
              </Text>
            </View>
            {selectedOrder?.delivery_time && (
              <View style={styles.infoRowOne}>
                <Text style={styles.infoLabelOne}>Delivered Time:</Text>
                <Text style={styles.infoValueOne}>
                  {selectedOrder?.delivery_time
                    ? new Date(selectedOrder.delivery_time).toLocaleString()
                    : "Pending"}
                </Text>
              </View>
            )}
          </View>

          {selectedOrder?.menu_items && selectedOrder.menu_items.length > 0 && (
            <View style={styles.modalSectionOne}>
              <Text style={styles.sectionTitleOne}>Menu Items</Text>
              {selectedOrder.menu_items.map((item, index) => (
                <View key={item.id || index} style={styles.infoRowOne}>
                  <Text style={styles.infoLabelOne}>{index + 1}.</Text>
                  <Text style={styles.infoValueOne}>{item.name}</Text>
                </View>
              ))}
            </View>
          )}

          {selectedOrder?.order?.customer && (
            <View style={styles.modalSectionOne}>
              <Text style={styles.sectionTitleOne}>Customer Details</Text>
              <View style={styles.infoRowOne}>
                <Text style={styles.infoLabelOne}>Name:</Text>
                <Text style={styles.infoValueOne}>
                  {selectedOrder?.order?.customer.full_name}
                </Text>
              </View>
              <View style={styles.infoRowOne}>
                <Text style={styles.infoLabelOne}>Phone:</Text>
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(
                      `tel:${selectedOrder?.order?.customer.phone_number}`
                    )
                  }
                >
                  <Text style={[styles.infoValueOne, { color: "#0066CC" }]}>
                    {selectedOrder?.order?.customer.phone_number}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {selectedOrder?.order?.address && (
            <View style={styles.modalSectionOne}>
              <Text style={styles.sectionTitleOne}>Delivery Address</Text>
              {selectedOrder.order.address.label && (
                <View style={styles.infoRowOne}>
                  <Text style={styles.infoLabelOne}>Label:</Text>
                  <Text style={styles.infoValueOne}>
                    {selectedOrder.order.address.label}
                  </Text>
                </View>
              )}
              {selectedOrder.order.address.zone && (
                <View style={styles.infoRowOne}>
                  <Text style={styles.infoLabelOne}>Zone:</Text>
                  <Text style={styles.infoValueOne}>
                    {selectedOrder.order.address.zone}
                  </Text>
                </View>
              )}
              {selectedOrder.order.address.street && (
                <View style={styles.infoRowOne}>
                  <Text style={styles.infoLabelOne}>Street:</Text>
                  <Text style={styles.infoValueOne}>
                    {selectedOrder.order.address.street}
                  </Text>
                </View>
              )}
              {selectedOrder.order.address.building && (
                <View style={styles.infoRowOne}>
                  <Text style={styles.infoLabelOne}>Building:</Text>
                  <Text style={styles.infoValueOne}>
                    {selectedOrder.order.address.building}
                  </Text>
                </View>
              )}
              {selectedOrder.order.address.floor && (
                <View style={styles.infoRowOne}>
                  <Text style={styles.infoLabelOne}>Floor:</Text>
                  <Text style={styles.infoValueOne}>
                    {selectedOrder.order.address.floor}
                  </Text>
                </View>
              )}
              {selectedOrder.order.address.apartment && (
                <View style={styles.infoRowOne}>
                  <Text style={styles.infoLabelOne}>Apartment:</Text>
                  <Text style={styles.infoValueOne}>
                    {selectedOrder.order.address.apartment}
                  </Text>
                </View>
              )}
            </View>
          )}

          {selectedOrder?.notes && (
            <View style={styles.modalSectionOne}>
              <Text style={styles.sectionTitleOne}>Notes</Text>
              <Text style={styles.notesTextOne}>{selectedOrder.notes}</Text>
            </View>
          )}
        </ScrollView>
        <View style={styles.modalActionsOne}>
          {!selectedOrder?.order?.is_paid && (
            <TouchableOpacity
              style={styles.paymentButtonModalOne}
              onPress={() => onSettlePayment(selectedOrder)}
            >
              <Text style={styles.paymentButtonTextModalOne}>
                Settle Payment
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.closeButtonOne} onPress={onClose}>
            <Text style={styles.closeButtonTextOne}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Payment Modal Component
const PaymentModal = ({
  currentPaymentOrder,
  selectedPayment,
  setSelectedPayment,
  customers,
  selectedCustomer,
  setSelectedCustomer,
  onConfirm,
  onClose,
}) => {
  const [scaleValue] = useState(new Animated.Value(1));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardView}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Settle Payment</Text>
            <Text style={styles.modalSubtitle}>
              Order {currentPaymentOrder?.orderNumber || "N/A"}
            </Text>
            <Text style={styles.sectionTitle}>Payment Type</Text>
            <View style={styles.paymentTypes}>
              {["Cash", "Card", "Credit"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.paymentButton,
                    selectedPayment === type.toLowerCase() &&
                      styles.selectedPayment,
                  ]}
                  onPress={() => setSelectedPayment(type.toLowerCase())}
                >
                  <Text
                    style={[
                      styles.paymentText,
                      selectedPayment === type.toLowerCase() &&
                        styles.selectedPaymentText,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedPayment === "credit" && (
              <>
                {currentPaymentOrder?.customer ? (
                  <View style={styles.customerInfo}>
                    <Text style={styles.sectionTitle}>Customer</Text>
                    <Text style={styles.customerName}>
                      {currentPaymentOrder.customer.full_name}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.customerInfo}>
                    <Text style={styles.sectionTitle}>Select Customer</Text>
                    <Picker
                      mode="dropdown"
  dropdownIconColor="#000"
                      selectedValue={selectedCustomer}
                      style={styles.picker}
                      onValueChange={(itemValue) =>
                        setSelectedCustomer(itemValue)
                      }
                    >
                      <Picker.Item label="-- Select Customer --" value={null} />
                      {customers.map((cust) => (
                        <Picker.Item
                          key={cust.id}
                          label={`${cust.full_name} (${cust.phone_number})`}
                          value={cust.id}
                        />
                      ))}
                    </Picker>
                  </View>
                )}
              </>
            )}

            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Order Total</Text>
              <Text style={styles.totalAmount}>
                QAR {currentPaymentOrder?.amount || 0}
              </Text>
            </View>

            <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={onConfirm}
              >
                <LinearGradient
                  colors={["#6c5ce7", "#5a67d8"]}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.confirmButtonText}>Confirm Payment</Text>
                  <MaterialIcons name="check" size={24} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              style={styles.closeButtonSettle}
              onPress={onClose}
            >
              <Text style={styles.closeButtonTextSettle}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  viewMoreButton: {
    alignSelf: "center",
    // marginTop: 6,
    // backgroundColor: '#7e4bcc',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  viewMoreText: {
    color: "#000000ff",
    fontSize: 14,
    fontWeight: "250",
  },
  brandingSection: {
    backgroundColor: "#ffffff",
    paddingTop: 40,
    // paddingBottom: 15,
    paddingHorizontal: 0, // Remove horizontal padding to align with other content
  },

  brandingContainer: {
    flexDirection: "row",
    alignItems: "center",
    // paddingHorizontal: 20, // Add padding only to the container
  },

  brandLogo: {
    height: 32,
    width: 32,
    marginRight: 12,
  },

  brandText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: 0.5,
  },

  // brandingDivider: {
  //   height: 1,
  //   backgroundColor: "#f5f5f5",
  //   marginTop: 15,
  //   // marginHorizontal: 20,
  // },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  activeTab: {
    position: "relative",
  },
  tabText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#6C63FF",
    fontWeight: "600",
  },
  tabIndicator: {
    position: "absolute",
    bottom: -1,
    height: 2,
    width: "100%",
    backgroundColor: "#7e4bcc",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    color: "#666",
    fontSize: 16,
  },
  refreshButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 12,
    paddingHorizontal: 10,
  },
  statBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6a1b9a", // purple theme
  },
  // statLabel: {
  //   fontSize: 12,
  //   color: "#555",
  //   marginTop: 4,
  // },

  scrollContentOne: {
    paddingBottom: 20,
  },
  menuItemRowOne: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  menuItemTextOne: {
    fontSize: 14,
    color: "#333",
    flexShrink: 1,
  },

  modalContainerOne: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContentOne: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "95%",
    maxHeight: "90%",
    elevation: 5,
  },
  modalHeaderOne: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
    marginBottom: 15,
  },
  modalTitleOne: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#7e4bcc",
  },
  modalSectionOne: {
    marginBottom: 15,
  },
  sectionTitleOne: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7e4bcc",
    marginBottom: 8,
  },
  statsHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 60,
    marginBottom: 8,
    color: "#333",
  },

  statusRowOne: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusLabelOne: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
    color: "#555",
  },
  statusValueOne: {
    fontSize: 14,
    fontWeight: "600",
  },
  completedStatusOne: {
    color: "green",
  },
  pendingStatusOne: {
    color: "#d35400",
  },
  infoRowOne: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  infoLabelOne: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
  },
  infoValueOne: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  paidStatusOne: {
    color: "green",
  },
  unpaidStatusOne: {
    color: "red",
  },
  addressTextOne: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
  },
  notesTextOne: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#666",
  },
  modalActionsOne: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
    gap: 10,
  },
  paymentButtonModalOne: {
    backgroundColor: "#7e4bcc",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  paymentButtonTextModalOne: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  closeButtonModal: {
    backgroundColor: "#6c5ce7",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center", // Centers text horizontally
    justifyContent: "center", // Centers text vertically
  },
  closeText: {
    color: "#ffffffff",
    fontSize: 18,
    fontWeight: "500",
  },
  closeButtonOne: {
    backgroundColor: "#eee",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  closeButtonTextOne: {
    color: "#7e4bcc",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#7e4bcc",
    fontSize: 16,
  },
  keyboardView: {
    flex: 1,
  },
  selectedPaymentText: {
    color: "#6c5ce7",
    fontWeight: "bold",
  },
  confirmButton: {
    borderRadius: 15,
    overflow: "hidden",
    marginTop: 10,
  },
  gradientButton: {
    padding: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    marginRight: 10,
    fontFamily: "Poppins-Bold",
  },
  closeButtonSettle: {
    marginTop: 15,
    padding: 15,
    alignItems: "center",
  },
  closeButtonTextSettle: {
    color: "#796be6ff",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },
  successBox: {
    backgroundColor: "#e8f5e9",
    borderLeftWidth: 4,
    borderLeftColor: "#4caf50",
  },
  errorBox: {
    backgroundColor: "#ffebee",
    borderLeftWidth: 4,
    borderLeftColor: "#f44336",
  },
  successButton: {
    backgroundColor: "#4caf50",
  },
  errorButton: {
    backgroundColor: "#f44336",
  },
  settleButton: {
    backgroundColor: "#6c5ce7",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  settleButtonText: {
    color: "white",
    fontWeight: "bold",
  },

  // Loading indicator
  loadingContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  qrDataInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    backgroundColor: "#f9f9f9",
    color: "#555",
  },

  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#ffffffff",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  footer: {
    marginTop: 4,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0d7f0",
    paddingVertical: 12,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
  },
  footerButton: {
    alignItems: "center",
    flex: 1,
  },
  footerButtonText: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#6C63FF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 30,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  welcome: {
    fontSize: 18,
    color: "#7f8c8d",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#3498db",
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    marginTop: 40,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  statCard: {
    width: "48%", // ensures 2 per row with spacing
    backgroundColor: "#f5f5f5",
    paddingVertical: 14,
    marginBottom: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  // statCard: {
  //   flex: 1,
  //   backgroundColor: "#efededff",
  //   paddingVertical: 10,
  //   paddingHorizontal: 12,
  //   borderRadius: 8,
  //   marginRight: 8,
  //   alignItems: "center",
  // },

  statLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 4,
  },

  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6C63FF",
  },

  qrButton: {
    backgroundColor: "#6C63FF",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    minHeight: 80,
    flex: 0.8, // Takes slightly less space than statCards
    marginBottom: 25,
    marginTop: 8,
  },

  qrButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 6,
  },
  // statsContainer: {
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   marginBottom: 20,
  // },
  // statCard: {
  //   width: "48%",
  //   borderRadius: 12,
  //   padding: 16,
  //   alignItems: "center",
  //   elevation: 3,
  //   shadowColor: "#000",
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.1,
  //   shadowRadius: 4,
  // },
  statIcon: {
    marginBottom: 8,
  },
  // statValue: {
  //   fontSize: 24,
  //   fontWeight: "bold",
  //   color: "white",
  //   marginBottom: 4,
  // },
  statTitle: {
    fontSize: 14,
    color: "white",
    fontWeight: "500",
  },
  scanButton: {
    backgroundColor: "#2c3e50",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scanButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  scanButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  orderItem: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 6,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  pendingOrder: {
    borderLeftColor: "#f39c12",
  },
  completedOrder: {
    borderLeftColor: "#27ae60",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  orderId: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#2c3e50",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  pendingBadge: {
    backgroundColor: "#fef9e7",
  },
  completedBadge: {
    backgroundColor: "#eafaf1",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  orderInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  orderText: {
    color: "#555",
    fontSize: 14,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  orderAmount: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#2c3e50",
  },
  timeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    color: "#7f8c8d",
    fontSize: 14,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  scanOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50, // Push the scanning frame down
  },
  bottomButton: {
    marginTop: 20, // Space between button and other elements
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 10,
    position: "relative",
    marginBottom: 20,
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#27ae60",
  },
  cornerTL: {
    top: -1,
    left: -1,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 10,
  },
  cornerTR: {
    top: -1,
    right: -1,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 10,
  },
  cornerBL: {
    bottom: -1,
    left: -1,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 10,
  },
  cornerBR: {
    bottom: -1,
    right: -1,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 10,
  },
  scanText: {
    color: "white",
    fontSize: 16,
    marginTop: 20,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  closeButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    padding: 10,
  },

  closeButtonText: {
    color: "#6c5ce7",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },
  paddedCloseButton: {
    top: 60, // Move the close button down from the top
    // right: 20,
    // Keep other positioning styles
  },
  paddedContainer: {
    paddingTop: 50, // Adjust this value as needed
  },
  permissionText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  orderHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  orderIdContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  orderIdText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: "#34495e",
  },
  distanceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  distanceInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  distanceText: {
    fontSize: 16,
    color: "#555",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    color: "#333",
    fontFamily: "Poppins-Bold",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Poppins-Regular",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
    fontFamily: "Poppins-Bold",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f8f9fa",
  },
  itemName: {
    fontSize: 16,
    color: "#555",
    flex: 2,
  },
  itemDetails: {
    flexDirection: "row",
    gap: 20,
    flex: 1,
    justifyContent: "flex-end",
  },
  itemQuantity: {
    fontSize: 16,
    color: "#7f8c8d",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2c3e50",
    minWidth: 60,
    textAlign: "right",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6c5ce7",
    fontFamily: "Poppins-Bold",
  },
  paymentMethodContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 20,
  },
  paymentTypes: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  paymentButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
    backgroundColor: "#f8f9ff",
  },
  selectedPayment: {
    backgroundColor: "#eef2ff",
    borderColor: "#6c5ce7",
  },
  paymentMethod: {
    width: "48%",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ecf0f1",
    backgroundColor: "#f8f9fa",
  },
  selectedMethod: {
    borderColor: "#27ae60",
    backgroundColor: "#eafaf1",
  },
  paymentText: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 8,
    color: "#2c3e50",
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#555",
    marginBottom: 8,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: "white",
  },
  deliverButton: {
    backgroundColor: "#27ae60",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#95a5a6",
  },
  deliverButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  listContent: {
    paddingBottom: 20,
  },

  popupBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  popupCard: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  dataBox: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  dataText: {
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: "#9239dbff",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  customerInfo: {
    padding:4,
    marginVertical: 10,
    paddingVertical: 5,
     marginTop: 10,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 5,
  backgroundColor: '#fff',
  },
  picker: {
  height: 50,
  width: '100%',
  color: '#000', 
},

  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  ordersButton: {
    backgroundColor: "#6C63FF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 60,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  ordersButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  permissionContainer: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0,0,0,0.6)", // dim background
  padding: 20,
},
permissionText: {
  fontSize: 16,
  color: "#fff",
  marginBottom: 20,
  textAlign: "center",
},
closePermissionButton: {
  marginTop: 20,
  paddingVertical: 10,
  paddingHorizontal: 20,
  backgroundColor: "#7e4bcc",
  borderRadius: 8,
},
closePermissionText: {
  color: "#fff",
  fontSize: 16,
},

});

export { DeliveryDashboardScreen, OrdersScreen };
