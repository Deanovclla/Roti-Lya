import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, StatusBar, useWindowDimensions } from 'react-native';
import InventoryScreen from './src/apk-owner/InventoryScreen';
import ManualForm from './src/apk-owner/ManualForm';
import OrderTrackingScreen from './src/apk-owner/OrderTrackingScreen'; 
import OrderList from './src/apk-owner/OrderList'; 
import FinanceScreen from './src/apk-owner/FinanceScreen'; 

const testTheme = {
  colors: {
    primary: '#4A2E1B',     
    secondary: '#8D6E63',   
    background: '#FDFBF7',  
    cardBackground: '#FFF8E1', 
    white: '#FFFFFF',
    text: '#4A2E1B',
    activeNav: 'rgba(255, 255, 255, 0.15)' 
  }
};

export default function App() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  
  const [currentScreen, setCurrentScreen] = useState('Tracker');
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  const mockNavigation = {
    navigate: (screenName) => {
      if (screenName === 'Dashboard' || screenName === 'OrderList') {
        setCurrentScreen('Nota');
      } else if (screenName === 'OrderTracking') {
        setCurrentScreen('Tracker');
      } else if (screenName === 'Finance') {
        setCurrentScreen('Keuangan');
      } else {
        setCurrentScreen('Katalog');
      }
    }
  };

  const mainMenus = [
    { id: 'Kasir', label: 'Kasir', icon: '🎛️' },
    { id: 'Nota', label: 'Riwayat', icon: '🧾' },
    { id: 'Tracker', label: 'Dapur', icon: '👨‍🍳' },
    { id: 'Keuangan', label: 'Laporan', icon: '📊' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={testTheme.colors.primary} />
      
      {isMobile && (
        <View style={styles.mobileHeader}>
          <TouchableOpacity style={styles.hamburgerButton} onPress={() => setIsSidebarOpen(true)}>
            <Text style={styles.hamburgerIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.mobileTitle}>Roti Lya</Text>
          <View style={{ width: 40 }} />
        </View>
      )}

      <View style={styles.layoutBody}>
        {isMobile && isSidebarOpen && (
          <TouchableOpacity 
            style={styles.overlay} 
            activeOpacity={1} 
            onPress={() => setIsSidebarOpen(false)} 
          />
        )}

        {isSidebarOpen && (
          <View style={[styles.sidebar, isMobile && styles.sidebarMobile]}>
            <View style={styles.brandContainer}>
              <View style={styles.brandLeft}>
                <View style={styles.logoCircle}>
                  <Text style={{ fontSize: 16 }}>🥖</Text>
                </View>
                <Text style={styles.brandText}>Roti Lya</Text>
              </View>
              
              {isMobile && (
                <TouchableOpacity style={styles.closeButton} onPress={() => setIsSidebarOpen(false)}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.menuContainer}>
              {mainMenus.map((menu) => {
                const isActive = currentScreen === menu.id;
                return (
                  <TouchableOpacity
                    key={menu.id}
                    style={[styles.navItem, isActive && styles.navItemActive]}
                    onPress={() => {
                      setCurrentScreen(menu.id);
                      if (isMobile) setIsSidebarOpen(false);
                    }}
                  >
                    <Text style={styles.navIcon}>{menu.icon}</Text>
                    <Text style={[styles.navText, isActive && styles.navTextActive]}>
                      {menu.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.footerMenuContainer}>
              <TouchableOpacity
                style={[styles.navItem, currentScreen === 'Katalog' && styles.navItemActive]}
                onPress={() => {
                  setCurrentScreen('Katalog');
                  if (isMobile) setIsSidebarOpen(false);
                }}
              >
                <Text style={styles.navIcon}>⚙️</Text>
                <Text style={[styles.navText, currentScreen === 'Katalog' && styles.navTextActive]}>
                  Kelola Menu
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.mainContent}>
          {currentScreen === 'Katalog' && <InventoryScreen />}
          {currentScreen === 'Kasir' && <ManualForm navigation={mockNavigation} />}
          {currentScreen === 'Tracker' && <OrderTrackingScreen />}
          {currentScreen === 'Nota' && <OrderList navigation={mockNavigation} />}
          {currentScreen === 'Keuangan' && <FinanceScreen />}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  layoutBody: {
    flex: 1,
    flexDirection: 'row', 
    position: 'relative',
  },
  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4A2E1B',
    height: 56,
    paddingHorizontal: 8,
    zIndex: 10,
  },
  hamburgerButton: {
    padding: 10,
  },
  hamburgerIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  mobileTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 98,
  },
  sidebar: {
    width: 240,
    backgroundColor: '#4A2E1B',
    paddingVertical: 24,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    height: '100%',
  },
  sidebarMobile: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 99, 
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 10,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  brandText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 6,
  },
  closeButtonText: {
    color: '#FFF8E1',
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuContainer: {
    flex: 1,
    gap: 8,
  },
  footerMenuContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 16,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  navIcon: {
    fontSize: 18,
    marginRight: 16,
  },
  navText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 15,
    fontWeight: '600',
  },
  navTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
});