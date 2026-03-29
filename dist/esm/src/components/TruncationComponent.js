import React, { memo, useCallback } from "react";
import { View, Text } from "react-native";
import { useAppTextTheme } from "../context";
export const TruncationComponent = memo(({ children, maxLines, onExpand, expandText = "Read more", collapseText = "Read less", style, }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [isTruncated, setIsTruncated] = React.useState(false);
    const theme = useAppTextTheme();
    const handleTextLayout = useCallback((event) => {
        setIsTruncated(event.nativeEvent.lines.length > maxLines);
    }, [maxLines]);
    const handleToggle = useCallback(() => {
        setIsExpanded(!isExpanded);
        onExpand === null || onExpand === void 0 ? void 0 : onExpand();
    }, [isExpanded, onExpand]);
    return (<View>
        <Text style={style} numberOfLines={isExpanded ? undefined : maxLines} onTextLayout={handleTextLayout}>
          {children}
          {isTruncated && !isExpanded && "... "}
        </Text>
        {isTruncated && (<Text style={[style, { color: theme.colors.primary, marginTop: 4 }]} onPress={handleToggle}>
            {isExpanded ? collapseText : expandText}
          </Text>)}
      </View>);
});
