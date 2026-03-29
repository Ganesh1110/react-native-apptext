export const omitUndefined = (obj) => {
    const filtered = {};
    Object.keys(obj).forEach((key) => {
        if (obj[key] !== undefined) {
            filtered[key] = obj[key];
        }
    });
    return filtered;
};
export const createSpacingStyles = (props) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const { m, mt, mr, mb, ml, mx, my, p, pt, pr, pb, pl, px, py } = props;
    const marginTop = (_a = mt !== null && mt !== void 0 ? mt : my) !== null && _a !== void 0 ? _a : m;
    const marginRight = (_b = mr !== null && mr !== void 0 ? mr : mx) !== null && _b !== void 0 ? _b : m;
    const marginBottom = (_c = mb !== null && mb !== void 0 ? mb : my) !== null && _c !== void 0 ? _c : m;
    const marginLeft = (_d = ml !== null && ml !== void 0 ? ml : mx) !== null && _d !== void 0 ? _d : m;
    const paddingTop = (_e = pt !== null && pt !== void 0 ? pt : py) !== null && _e !== void 0 ? _e : p;
    const paddingRight = (_f = pr !== null && pr !== void 0 ? pr : px) !== null && _f !== void 0 ? _f : p;
    const paddingBottom = (_g = pb !== null && pb !== void 0 ? pb : py) !== null && _g !== void 0 ? _g : p;
    const paddingLeft = (_h = pl !== null && pl !== void 0 ? pl : px) !== null && _h !== void 0 ? _h : p;
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
