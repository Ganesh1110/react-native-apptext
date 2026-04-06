/**
 * AppTextContextMenu — Text Selection Context Menu
 *
 * A fully JS-driven context menu overlay that appears on long-press of any
 * wrapped content. Unlike native text selection menus (which require native
 * modules), this works everywhere React Native runs without any additional
 * setup.
 *
 * Features:
 *  - Positions the menu near the long-press location
 *  - Tap-outside-to-dismiss with semi-opaque backdrop
 *  - Supports any number of action items
 *  - Accessible (each action is an accessibilityRole="button")
 *  - Works on iOS, Android, and React Native Web
 *
 * Usage:
 * ```tsx
 * <AppTextContextMenu
 *   actions={[
 *     { label: 'Copy', onPress: () => Clipboard.setString(text) },
 *     { label: 'Share', onPress: () => Share.share({ message: text }) },
 *     { label: 'Speak', onPress: () => speak(text) },
 *   ]}
 * >
 *   <AppText selectable>{text}</AppText>
 * </AppTextContextMenu>
 * ```
 */

import React, {
  memo,
  useCallback,
  useRef,
  useState,
  useMemo,
} from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Dimensions,
} from "react-native";
import type { LayoutRectangle, GestureResponderEvent } from "react-native";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ContextMenuAction {
  /** Label shown in the menu item */
  label: string;
  /** Icon character or emoji to display before the label */
  icon?: string;
  /** Called when the item is tapped */
  onPress: () => void;
  /** When true, the item is rendered in a destructive (red) style */
  destructive?: boolean;
  /** When true, the item is disabled and un-tappable */
  disabled?: boolean;
}

export interface AppTextContextMenuProps {
  /** Actions to show in the popup menu */
  actions: ContextMenuAction[];
  /** The content to long-press */
  children: React.ReactNode;
  /** Extra long-press delay in ms. Default: 500 */
  longPressDelay?: number;
  /** Called when the menu opens */
  onMenuOpen?: () => void;
  /** Called when the menu closes */
  onMenuClose?: () => void;
  /** Backdrop opacity 0–1. Default: 0.3 */
  backdropOpacity?: number;
  /** Background colour of the menu card. Default: '#FFFFFF' */
  menuBackgroundColor?: string;
  /** Text colour for normal actions. Default: '#1F2937' */
  actionTextColor?: string;
  /** Text colour for destructive actions. Default: '#EF4444' */
  destructiveColor?: string;
}

// ---------------------------------------------------------------------------
// Position helpers
// ---------------------------------------------------------------------------

interface MenuPosition {
  top: number;
  left: number;
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const MENU_WIDTH = 200;
const ITEM_HEIGHT = 46;
const MENU_PADDING = 8;

function computeMenuPosition(
  touchX: number,
  touchY: number,
  actionCount: number,
): MenuPosition {
  const menuH = actionCount * ITEM_HEIGHT + MENU_PADDING * 2 + actionCount; // separators
  let top = touchY - menuH - 12;
  if (top < 20) top = touchY + 24; // flip below if no room above
  let left = touchX - MENU_WIDTH / 2;
  if (left < 8) left = 8;
  if (left + MENU_WIDTH > SCREEN_W - 8) left = SCREEN_W - MENU_WIDTH - 8;
  return { top, left };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const AppTextContextMenu = memo<AppTextContextMenuProps>(
  ({
    actions,
    children,
    longPressDelay = 500,
    onMenuOpen,
    onMenuClose,
    backdropOpacity = 0.3,
    menuBackgroundColor = "#FFFFFF",
    actionTextColor = "#1F2937",
    destructiveColor = "#EF4444",
  }) => {
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState<MenuPosition>({ top: 100, left: 80 });
    const longPressXY = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    const handleLongPress = useCallback(
      (e: GestureResponderEvent) => {
        const { pageX, pageY } = e.nativeEvent;
        longPressXY.current = { x: pageX, y: pageY };
        setPosition(computeMenuPosition(pageX, pageY, actions.length));
        setVisible(true);
        onMenuOpen?.();
      },
      [actions.length, onMenuOpen],
    );

    const handleClose = useCallback(() => {
      setVisible(false);
      onMenuClose?.();
    }, [onMenuClose]);

    const handleActionPress = useCallback(
      (action: ContextMenuAction) => {
        handleClose();
        // Small delay so the menu closes before the action's side effects run
        setTimeout(() => action.onPress(), 120);
      },
      [handleClose],
    );

    const menuStyle = useMemo(
      () => [
        styles.menu,
        {
          top: position.top,
          left: position.left,
          backgroundColor: menuBackgroundColor,
        },
      ],
      [position, menuBackgroundColor],
    );

    return (
      <>
        <Pressable
          onLongPress={handleLongPress}
          delayLongPress={longPressDelay}
          android_ripple={null}
        >
          {children}
        </Pressable>

        <Modal
          visible={visible}
          transparent
          statusBarTranslucent
          animationType="fade"
          onRequestClose={handleClose}
          accessible={false}
        >
          {/* Backdrop — tap to dismiss */}
          <Pressable
            style={[styles.backdrop, { opacity: backdropOpacity }]}
            onPress={handleClose}
          />

          {/* Menu card */}
          <View style={menuStyle} accessible accessibilityViewIsModal>
            {actions.map((action, index) => (
              <React.Fragment key={`menu-action-${index}`}>
                {index > 0 && <View style={styles.separator} />}
                <TouchableOpacity
                  style={[styles.actionRow, action.disabled && styles.actionDisabled]}
                  onPress={action.disabled ? undefined : () => handleActionPress(action)}
                  activeOpacity={0.6}
                  accessibilityRole="button"
                  accessibilityLabel={action.label}
                  accessibilityState={{ disabled: action.disabled }}
                >
                  {action.icon ? (
                    <Text style={styles.actionIcon}>{action.icon}</Text>
                  ) : null}
                  <Text
                    style={[
                      styles.actionLabel,
                      {
                        color: action.destructive
                          ? destructiveColor
                          : actionTextColor,
                        opacity: action.disabled ? 0.4 : 1,
                      },
                    ]}
                  >
                    {action.label}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </Modal>
      </>
    );
  },
);

AppTextContextMenu.displayName = "AppTextContextMenu";

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
  },
  menu: {
    position: "absolute",
    width: MENU_WIDTH,
    borderRadius: 12,
    paddingVertical: MENU_PADDING,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
    // Glass-morphism border
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.08)",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0,0,0,0.08)",
    marginHorizontal: 12,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: ITEM_HEIGHT,
    gap: 10,
  },
  actionDisabled: {
    opacity: 0.5,
  },
  actionIcon: {
    fontSize: 16,
    width: 22,
    textAlign: "center",
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: "400",
    letterSpacing: 0.1,
    flex: 1,
  },
});
