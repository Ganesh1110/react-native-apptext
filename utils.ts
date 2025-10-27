import { SpacingProps } from "./types";
import { TextStyle } from "react-native";

export const omitUndefined = <T extends Record<string, any>>(
  obj: Partial<T>
): T => {
  const filtered = {} as T;
  (Object.keys(obj) as Array<keyof T>).forEach((key) => {
    if (obj[key] !== undefined) {
      filtered[key] = obj[key]!;
    }
  });
  return filtered;
};

export const createSpacingStyles = (
  props: SpacingProps
): Pick<
  TextStyle,
  | "marginTop" | "marginRight" | "marginBottom" | "marginLeft"
  | "paddingTop" | "paddingRight" | "paddingBottom" | "paddingLeft"
> => {
  const { m, mt, mr, mb, ml, mx, my, p, pt, pr, pb, pl, px, py } = props;

  const marginTop = mt ?? my ?? m;
  const marginRight = mr ?? mx ?? m;
  const marginBottom = mb ?? my ?? m;
  const marginLeft = ml ?? mx ?? m;

  const paddingTop = pt ?? py ?? p;
  const paddingRight = pr ?? px ?? p;
  const paddingBottom = pb ?? py ?? p;
  const paddingLeft = pl ?? px ?? p;

  return omitUndefined({
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
  });
};