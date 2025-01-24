let Tl = "brio", Bl = "$", br = "$store", pe = "after", Lr = "animation engine", Yl = "append", lt = "array", Qe = "attr", Kl = "Attribute", w = "b-", Le = "before", ul = "begin", Hr = "body", Ut = "boolean", Il = "both", Li = "can only be used on", Hi = "Cannot ", Ge = "checkbox", ve = "checked", Dr = "classList", Gl = "composi", Mr = "Content", Je = "create", Wl = "data", zt = "debounce", Di = "define", m = "delete", Ie = "directive", _l = "disconnect", hl = "display", Mi = "document", mi = "each", xe = "element", xt = "end", si = "entries", Nl = "error", Ye = "evalEffect", Ui = "event", xi = "EventListener", Fi = "expArgs", pt = "get", mr = "head", z = "hooks", fi = "href", it = "html", Bi = "HTML", Pt = "hydrate", Yi = "in", rl = "inner", gt = "insert", Ur = "Invalid", ni = "length", zl = "mask", xr = "method", Ki = "must be", Z = `
`, At = "newValue", Fr = "name", Gi = "Node", ht = "not found.", Fe = null, re = "number", Ct = "object", Wi = "observe", Rt = "oldValue", zi = "once", Br = "onComplete", Ze = "onSet", _e = "options", qi = "out", ql = "outer", sl = "parent", ai = "patch", $l = "pause", Ei = "play", Yr = "post", Kr = "prepend", vi = "prevent", Xi = "Propert", vl = Xi + "y", Ce = "props", ji = "put", ci = "radio", Et = "remove", Qi = "replace", Xl = "requires", Ji = "reverse", Ve = "route", V = "script", Gr = "Sibling", fl = "skip", q = "select", se = "state", Zi = "start", jl = "storage", ke = "string", ne = "style", Vi = "teleport", ee = "template", Te = "text", Ti = "throttle", Ql = "tion", er = "toString", Jl = "tokens", Ot = "transition", tr = "type", rt, pl = "update", Wr = "validate", p = "value", lr = "With", zr = "add" + xi, qt = Bl + Wl, vt = Bl + mi, Pl = Bl + Ce, Se = w + Wl, qr = w + mi, gl = "b-if", ir = w + Ce, Ft = "b-show", vr = "clone" + Gi, Xt = Gl + "ng", Xr = Gl + Ql + Zi, jr = Gl + Ql + xt, Qr = Je + "Element", Cl = Di + vl, Jr = Di + Xi + "ies", Zr = "de" + Pt, ui = m + vl, wt = "func" + Ql, Vr = pt + Kl, j = rl + Bi, F = "in" + ji, es = gt + "AdjacentHTML", rr = zl + "Token", ts = "next" + Gr, ls = "of " + tr, St = ql + Bi, sr = "Own" + vl, is = sl + Gi, ol = "path" + Fr, rs = vi + "Default", fr = "proto" + tr, ss = Et + Kl, fs = Et + xi, jt = Qi + lr, oi = Ve + "Rule", yl = q + "ionStart", ns = "set" + Kl, as = Zi + "s" + lr, Es = jl + "Area", Qt = "tar" + pt, Xe = Te + "area", He = Te + Mr, cs = "async" + wt, nr = pt + sr + "Descriptor", Ts = nr + "s", us = "has" + sr, Zl = (e, t, l, r) => `the ${e} ${t} ${Xl} ${l}, ` + wl(r), wl = (e) => `but got ${e} instead.`, X = (e, t) => e.push(t), Vl = (e, t) => e.sort(t), os = (e) => e[Ji](), de = (e, t) => e.join(t), P = (e, t) => e.forEach(t), Ae = (e, t, l) => e.map(t, l), et = (e, t, l) => e.filter(t, l), ys = (e, t, l) => e.find(t, l), ar = (e, t, l) => e.every(t, l), As = (e, t, l) => e.findIndex(t, l), Rs = (e, t, l) => e.indexOf(t, l), Er = (e, t) => t[1] - e[1], ct = (e) => Array.from(e), Ss = (e, t = 0) => Ae(ct({ length: e }), (l, r) => t + r), ds = (e, t) => e[er](t), Y = (e) => e.trim(), kt = (e) => e.toLowerCase(), K = (e, t, l) => e.split(t, l), ei = (e, t) => e.match(t), ae = (e, t, l) => e[as](t, l), we = (e, t) => t.test(e), te = (e, t, l) => e[Qi](t, l), Os = (e) => we(e, /^\d+$/), Is = (e) => we(e, /^(\w|\s|\.|\$|`|'|"|(\[(.|\s)+?\]))*;?$/g) && !ae(e, m + " "), nl = (e) => we(Y(e), /^((async\s+)?function\s*\([^)]*\)\s*{[^}]*}|(async\s*)?(?:\([^()]*\)|[$\w]+)\s*=>)/), cr = (e) => JSON.stringify(e), ti = (e, t) => {
  try {
    e = JSON.parse(e, t);
  } catch {
  }
  return e;
}, _s = (e) => {
  let t = ds(new URLSearchParams(e));
  return t ? "?" + t : "";
}, Tr = (e) => "`" + te(e, /`/g, "\\`") + "`", st = (e) => kt(W(oe[fr][er].call(e), 8, -1)), Ke = (e, t) => st(e) === t, Ee = (e) => e === Fe, Be = (e) => e === rt, Tt = (e) => Ke(e, Ct), ue = (e) => Ke(e, lt), bt = (e) => hs(e) || Ns(e), hs = (e) => Ke(e, wt), Ns = (e) => Ke(e, cs), De = (e) => Ke(e, ke), ur = (e) => Ke(e, re) && isFinite(e), $s = (e) => Ke(e, Ut), ps = (e) => al(e, or), al = (e, t) => e instanceof t, ft = (e) => al(e, Node), Ps = (e) => al(e, Text), nt = (e) => al(e, HTMLElement), be = window, oe = Object, We = Reflect, Bt = location, Lt = document, or = RegExp, v = (e, t, l) => Tt(e) && t in e ? e[t] : l, It = (e) => x(ce(e)), gs = (e, ...t) => {
  P(t, ([l, r]) => {
    l in e && (e[r] = e[l], Ht(e, l));
  });
}, ce = (e) => oe.keys(e), yr = (e = Fe) => oe[Je](e), Cs = (e, t = {}) => {
  const l = yr(e);
  return oe[Jr](
    l,
    oe[Ts](t)
  ), l;
}, ws = (e, t, l = oe) => l[nr](e, t), ks = (e) => oe.getPrototypeOf(e), at = (e, t) => oe[fr][us].call(e, t), Q = (e, t, l = {}) => {
  gs(l, ["v", p], ["w", "writable"], ["e", "enumerable"], ["c", "configurable"]), oe[Cl](e, t, l);
}, bs = (e, t = {}) => {
  P(ce(e), (l) => {
    Q(e, l, t);
  });
}, Ht = (e, t) => delete e[t], Ls = (e) => P(ce(e), (t) => {
  Ht(e, t);
}), he = () => /* @__PURE__ */ new Map(), Jt = (e, t) => new or(e, t), H = (e, t, l) => e.includes(t, l), li = (e) => Tt(e) ? oe[si](e) : e[si](), W = (e, t, l) => e.slice(t, l), x = (e) => Be(e[ni]) ? e.size : e[ni], Ne = (e, t = 0) => setTimeout(e, t), Zt = (e, t) => {
  let l;
  return (...r) => {
    clearTimeout(l), l = Ne(() => e(...r), t);
  };
}, Hs = (e, t) => {
  let l = 0;
  return (...r) => {
    let i = Date.now();
    if (!(i - l < t))
      return l = i, e(...r);
  };
}, Ar = (e = 8) => "b" + W(te(crypto.randomUUID(), /-/g, ""), 0, e - 1), Rr = (e, ...t) => console[e]("Brio.js", ...t), Sr = (...e) => Rr("warn", "warn:", ...e), b = (...e) => Rr(Nl, `detected an ${Nl}:`, ...e), kl = !1, bl = [], dr = (e) => (bl = [], kl = !0, e({}), kl = !1, [...bl]), Ds = (e) => {
  let t = dr(e), l = [];
  for (let i of t) {
    let s = x(l) - 1, a = l[s];
    a && a[0][a[1]] === i[0] ? l[s] = i : X(l, i);
  }
  l = l.filter((i) => i[1] in i[0]).filter(([i, s], a, n) => As(n, ([E, f]) => i === E && s == f) == a);
  let r;
  if (x(l) == 1) {
    let [i, s] = l[0];
    r = (a) => Be(a) ? i[s] : i[s] = a;
  }
  return r;
}, Al = yr(), Ms = () => dt, M = (e, t, l = "", r = !1) => {
  let i = 0, s;
  return Is(t) ? (s = Ds(() => yi(e, t)), s ? (i = 1, bt(s()) && (i = 2, t = Me(`${t}(${l})`, l, r))) : t = Me(t, l, r)) : nl(t) || (t = Me(t, l, r)), [i == 1 ? s : (...n) => yi(e, t)(...n), i];
}, yi = (e, t) => {
  let l = Al[t];
  try {
    l || (l = new Function(Nt[Fi], `return(${t})`)), !Al[t] && x(t) < 99 && (Al[t] = l), l = l({ ...e.gc, ...e.lc });
  } catch (r) {
    b(r.message, "in expression:", t), l = Ms;
  }
  return l;
}, Me = (e, t = "", l = !1) => `(${t})=>${l ? "{" : "("}${Z + e + Z}${l ? "}" : ")"}`, ms = (e, t, l, r) => {
  let [i, s] = r[z], a = W(t, ae(t, w) ? 5 : 3), [n] = K(a, "-"), E = e[_e][t] || {}, f = e.el, [c, T] = M(e, l, "$entry", !0);
  i(f, t, Zt(c, E[zt] || 100));
  let o = new IntersectionObserver((h) => {
    P(h, async (S) => {
      S.isIntersecting != (n == "exit") && (T != 1 ? await s(f, t, S) : b(Zl(Ui, t, "a " + wt, st(c()))), E[zi] && o[_l]());
    });
  }, E);
  o[Wi](f), G(e, () => o[_l]());
}, ut = (e, t = Lt) => ct(t.querySelectorAll(e)), D = (e, t = Lt) => De(e) ? ut(e, t)[0] : e, le = (e, t, ...l) => e[t](...l), Us = (e, t, l) => {
  t == j || t == St ? e[t] = l : e[es](t, l);
}, xs = (e, t, l) => {
  l && J(l) ? le(l, Le, e) : le(t, Yl, e);
}, Fs = (e) => e[vr](!0), Ai = (e) => {
  let t = J(e);
  if (t) {
    let l = fe(t), r = l.indexOf(e), i = os(W(l, 0, r)), s = W(l, r + 1);
    return () => {
      let a = !1;
      for (let n of s)
        if (J(n) == t) {
          le(n, Le, e), a = !0;
          break;
        }
      if (!a) {
        for (let n of i)
          if (J(n) == t) {
            le(n, pe, e), a = !0;
            break;
          }
      }
      a || le(t, Yl, e);
    };
  }
}, Ll = (e, t) => P(ct(e.attributes), ({ name: l, value: r }) => t(l, r)), El = (e) => e[Et](), J = (e) => e[is], Bs = (e) => e[ts], Or = (e) => Y(e[He] || ""), fe = (e) => [...e.childNodes], B = (e, t) => e[Vr](t), Vt = (e, t, l, r) => {
  r && (e[r] = l), e[ns](t, l);
}, cl = (e, t) => e[ss](t), Ys = (e, t) => e[Dr].add(t), ii = (e, t) => Lt[Qr](e, t), Ks = (e) => new DOMParser().parseFromString(e, Te + "/" + it), Oe = (e) => kt(e.tagName || ""), Re = (e, t, l, r) => (De(e) && (e = D(e)), e[zr](t, l, r), () => e[fs](t, l)), me = (e, t, l) => D(e).dispatchEvent(new CustomEvent(kt(te(t, /[^a-z\d]/gi, "")), {
  bubbles: !0,
  cancelable: !0,
  detail: l
})), Hl = async (e, t) => {
  if (await t(e))
    for (let l of fe(e))
      await Hl(l, t);
}, Gs = (e) => e[Qt][Xt] = !0, Ws = (e) => {
  let t = e[Qt];
  t[Xt] && (t[Xt] = !1, me(t, F));
}, Ir = (e) => be.getComputedStyle(e), zs = (e) => {
  let t = Ir(e);
  return !(!J(e) || t[hl] == "none" || t.visibility == "hidden" || t.opacity == "0");
}, qs = (e, t) => new URL(e, t), Yt = (e = "", t = fi) => qs(e, Bt[fi])[t], _r = (e) => H(["src", p, ve, q + "ed"], e), Ri = (e, t = "") => `:not([${e}]${t})`, vs = (e, t, l, r) => {
  let [i, s] = r[z], a = W(t, ae(t, w) ? 5 : 3);
  K(a, "-");
  let n = e.el, E = e[_e][t] || {}, f = E[Mi] ? D(it) : n, [c] = M(e, l, "$size", !0);
  i(n, t, Zt(c, E[zt] || 100));
  let T = new ResizeObserver((o) => {
    let h = o[0].borderBoxSize[0];
    s(n, t, [h.inlineSize, h.blockSize]);
  });
  T[Wi](f, E), G(e, () => T[_l]());
}, ze = "keyup", qe = "keydown", Si = "outside", Xs = "window", hr = "control", Dl = "meta", Dt = "arrow", di = [
  Dl,
  hr,
  "shift",
  "alt",
  "fn"
], js = {
  ctrl: hr,
  cmd: Dl,
  super: Dl,
  esc: "escape",
  del: m,
  up: Dt + "up",
  down: Dt + "down",
  left: Dt + "left",
  right: Dt + "right"
}, Qs = (e, t, l, r) => {
  let [i, s] = r[z], a = W(t, ae(t, w) ? 5 : 3), [n] = K(a, "-");
  if (n == "enter" || n == "exit")
    return ms(e, t, l, r);
  if (n == "resize")
    return vs(e, t, l, r);
  let E = e.el, f = E, c = (d) => {
    let [g] = M(e, l, "$event", !0);
    bt(g) ? g(d) : b(Zl(Ui, t, "a " + wt, st(g())));
  }, T = e[_e][t] || {};
  zt in T && (c = Zt(c, T[zt])), Ti in T && (c = Hs(c, T[Ti])), i(E, t, c), T[Si] || T[Mi] ? f = Lt : T[Xs] && (f = be);
  let o = {};
  H([qe, ze], n) && P(v(T, "keys", []), (d) => {
    o[js[d] || d] = !0;
  });
  let h = It(o), S = n;
  if (H([qe, ze], n) && h) {
    let d = {};
    n = t;
    let g = Zt(($) => {
      me(f, n, $);
    }, 600);
    G(e, Re(f, qe, ($) => {
      let k = kt($.key);
      d[k] || (d[k] = !0), Ne(() => {
        d.meta && !H(di, k) && Rl($, d);
      });
      let U = ce(d);
      h > 1 && ze == S && d.meta && !H(di, k) ? g(U) : qe == S && me(f, n, U);
    })), G(e, Re(f, ze, ($) => {
      qe == S && Rl($, d), me(f, n, ce(d)), ze == S && Rl($, d);
    })), G(e, Re(f, "focus", () => {
      Ls(d);
    }));
  }
  G(e, Re(f, n, (d) => {
    if (T[vi] && d[rs](), T.stop && d.stopPropagation(), !(T.self && d[Qt] !== d.currentTarget) && !(T[Si] && (E.contains(d[Qt]) || !zs(E)))) {
      if (H([qe, ze], S)) {
        let g = d.detail;
        if (!(It(o) == It(g) && ar(ce(o), ($) => H(g, $))))
          return;
      }
      s(E, t, d);
    }
  }, T));
}, Rl = (e, t) => {
  let l = kt(e.key);
  t[l] && Ht(t, l);
}, Js = (e, t, l, r) => {
  let i = W(t, ae(t, w) ? 7 : 5);
  l = l || qt + `['${i}']`, nl(l) || (l = Me(l, "$initial"));
  let s = B(e.el, i) || "", a = e[_e][t] || {};
  r[Ye](e, t, l, (n) => ([E]) => {
    let f = E(s), c = a.prop || _r(i) && i;
    f || c ? Vt(n, i, !c && f === !0 ? "" : f, c) : cl(n, i);
  });
}, ie = (e) => {
  let t = ({ prop: l }, r) => (Ue[m](t), r[fl].add(l), e);
  return Ue.add(t), t;
}, $e = (e, t) => {
  if (!Oi(e) || Pe(e)) return e;
  let l = v(t, sl, Fe);
  t = { parent: l };
  let r = {
    get(n, E) {
      return kl && (at(n, E) || !(E in n)) && X(bl, [i, E]), We.get(n, E, i);
    },
    set(n, E, f) {
      E in n || Q(n, E, { w: !0, e: !0, c: !0 });
      let c = i[E];
      if (c === f) return !0;
      let T = je(i);
      Ue.has(f) && (f = f({ [se]: i, prop: E, [At]: f, [Rt]: c }, T, f)), s.has(E) || (f = $e(f)), Pe(c) && Pe(f) && (_t.set(f, je(c)), _t[m](c));
      let o = We.set(n, E, f, i);
      return T[Ze][E] && P(T[Ze][E], (h) => h({ [se]: i, prop: E, [At]: f, [Rt]: c }, T, h)), Ii(T, i, E, f, c), o;
    },
    [ui](n, E) {
      let f = n[E], c = We[ui](n, E);
      return Ii(je(i), i, E, rt, f), c;
    },
    [Cl](n, E, f) {
      let c = f[p], T = i[E];
      return Ue.has(c) && (f[p] = c({ [se]: i, prop: E, [At]: c, [Rt]: T }, je(i), c)), !s.has(E) && p in f && (f[p] = $e(f[p])), We[Cl](n, E, f);
    }
  };
  const i = new Proxy(Pe(l) ? Cs(l, e) : e, r), s = /* @__PURE__ */ new Set();
  let a = {
    [se]: he(),
    [Ce]: {},
    skip: s,
    [Ze]: {}
  };
  _t.set(i, a);
  for (let n in e) {
    let E = e[n];
    Ue.has(E) ? (E = E({ [se]: i, prop: n, [At]: E, [Rt]: rt }, a, E), We.set(e, n, E, i)) : !s.has(n) && Oi(E) && We.set(e, n, E, i);
  }
  return i;
}, Oi = (e) => ue(e) || Tt(e), Ii = (e, t, l, r, i) => {
  let a = { operation: Be(i) ? Je : Be(r) ? m : pl, [se]: t, prop: l, [At]: r, [Rt]: i };
  _i(e[se], a), e[Ce][l] && _i(e[Ce][l], a);
}, _i = async (e, t) => {
  let l = ct(e);
  Vl(l, Er);
  for (let [r] of l) await r(t);
}, Zs = (e, t, l) => {
  e[Ze][t] || (e[Ze][t] = /* @__PURE__ */ new Set()), e[Ze][t].add(l);
}, Nr = "getItem", $r = "setItem", Ml = he(), Vs = (e) => {
  let t = ks(e);
  return t && at(t, Nr) && at(t, $r);
}, ml = (e, t) => ti(e[Nr](t) || ""), hi = (e, t, l) => e[$r](t, cr(l)), Ni = (e) => "_b_" + e, pr = (e, t, l) => {
  if (!Vs(e))
    return b(Ur, jl, Ct);
  l && (l = Ni(l), at(e, l) && (t = ml(e, l)));
  let r = ({ state: i, prop: s }, a) => {
    Ue[m](r), Ml.set(l, [i, s, e]), l = l || Ni(s), at(e, l) ? t = ml(e, l) : hi(e, l, t);
    let n = () => hi(e, l, i[s]);
    return Ne(() => tt(i, s, n)), Zs(a, s, ({ state: E, prop: f }) => {
      Pe(E[f]) && tt(E[f], "", n);
    }), t;
  };
  return Ue.add(r), r;
}, ef = (e) => {
  if (Ml.has(e.key)) {
    let [t, l, r] = Ml.get(e.key);
    r === e[Es] && (t[l] = ml(r, e.key));
  }
}, Kt = (e, t, l = 0) => {
  let r = [], i = dr(t || e);
  return P(i, ([s, a]) => {
    X(r, gr(s, a, e, l));
  }), t && e({}), () => P(r, (s) => s());
}, tt = (e, t, l, r = 0) => (
  // If the proxied object is not an observed state, log an error and return an empty function
  !Pe(e) && !b(Hi + `watch non-${se} ${Ct}/${lt}.`) ? () => {
  } : at(e, t) ? gr(e, t, l, r) : Pr(e, l, r)
), _t = he(), Ue = /* @__PURE__ */ new Set(), Pe = (e) => _t.has(e), je = (e) => _t.get(e), Pr = (e, t, l = 0) => {
  if (Pe(e)) {
    let r = je(e)[se];
    return r.set(t, l), () => r[m](t);
  }
}, gr = (e, t, l, r = 0) => {
  let i = je(e)[Ce];
  i[t] || (i[t] = he()), i[t].set(l, r);
  let s = Pr(e[t], l, r);
  return () => {
    i[t][m](l), s && s();
  };
};
Q($e, "persist", { v: (e, t) => pr(localStorage, e, t) });
Q($e, "session", { v: (e, t) => pr(sessionStorage, e, t) });
Q($e, fl, { v: ie });
let Mt = he(), tf = (e, t, l, r) => {
  let [i, s] = r[z], a = `the ${t} ` + Ie, n = Xl + " a reactive " + p, E = q + "ed", f = e.el, c = Oe(f), T = f.type;
  if (!H([F, Xe, q], c))
    return b(a, Li, F, `, ${Xe}, and ${q} ${xe}s.`, f);
  let [o, h] = M(e, l);
  if (h != 1)
    return b(a, n + ",", wl(o()));
  let S = o(), N, d = () => ct(c == q ? f[_e] : L()), g = e[_e][t] || {}, $ = (O) => {
    let I = O[Ee(B(O, p)) && U ? ve : p], C = Mt.get(O) || g;
    if (De(I) && (C.trim && (I = Y(I)), !C.raw)) {
      let ye = ti(I);
      (ur(ye) || Ee(ye) || $s(ye)) && (I = ye);
    }
    return I;
  }, k = (O) => c == F && H(O, T), U = k([Ge, ci]), L = () => ut(F + `[type="${Ge}"][name="${f.name}"]`), y = () => k(Ge) && x(L()) > 1, A = () => {
    let O = [
      [F, Ge, [re, ke, Ut, lt]],
      [F, ci, [re, ke, Ut]],
      [F, re, [re]],
      [F, "range", [re]],
      [F, "", [re, ke]],
      [Xe, "", [re, ke]],
      [q, "", [re, ke, Ut, lt]]
    ];
    for (let [I, C, ye] of O)
      if (c == I && (!C || T == C)) {
        Ee(S) || Be(S) || H(ye, st(S)) || Sr(a, n, ls, de(ye, " or "), `for ${c == F ? T + " " : ""}${I} ${xe}s,`, wl(st(S)), f);
        break;
      }
  };
  Ne(() => {
    A(), q == c ? P(d(), (O) => Mt.set(O, g)) : k(Ge) && Mt.set(f, g);
  }, 1);
  let u = () => {
    if (S = o(), N = $(f), H([F, Xe], c))
      if (T == Ge && ue(S))
        f[ve] = H(S, N);
      else if (U)
        f[ve] = S === N;
      else {
        if (f[Xt] || Lt.activeElement === f && S === N) return;
        S !== N && (f[p] = S);
      }
    else c == q && (ue(S) ? P(d(), (O) => {
      O[E] = H(S, $(O));
    }) : f[p] = S);
  };
  Ne(() => G(e, Kt(u)), 5);
  let R = {};
  i(f, t, (O) => {
    if (S = o(), c == q && f.multiple || y()) {
      let I = [];
      P(d(), (C) => {
        c == q && Mt.set(C, g), (C[E] || C[ve]) && X(I, $(C));
      }), o(I);
    } else o(U && !f[ve] ? !1 : $(f));
  }), (k([Te, "search", "url", "tel", "email", "password"]) || c == Xe) && (R[Xr] = Gs, R[jr] = Ws);
  let _ = g.lazy || U || c == q ? "change" : F;
  R[_] = () => s(f, t, o);
  for (let [O, I] of li(R))
    G(e, Re(f, O, I));
}, Gt = "output", ge = "cursor", ri = "character", Ul = "quantifier", el = "isToken", tl = "isOptional", xl = "isMultiple", Fl = "parts", lf = (e, t, l, r) => {
  let i = e.el, [s, a] = r[z];
  if (!(p in i && yl in i))
    return b("the", t, Ie, Li, Xe, xe + "s and textual", F, "types (text, email, etc.).");
  let n = l, E;
  r.mask[n] && (E = r.mask[n]);
  let f = e[_e][t] || {}, c = {
    ...f,
    tokens: { ...r[rr], ...f[Jl] },
    mask: n,
    [p]: "",
    [ge]: i[yl],
    [Fl]: [],
    [Gt]: ""
  };
  s(i, t, () => {
    c[p] = i[p], c[p] != c[Gt] && (c[Fl] = [], c[ge] = i[yl], E && E(c), ff(c), i[p] = c[Gt], i.setSelectionRange(c[ge], c[ge]), me(i, zl, c));
  }), Ne(() => a(i, t), 7);
  let T = Re(i, F, () => a(i, t), !0);
  G(e, T);
}, rf = (e, t) => {
  let l = [], r = "\\";
  for (let i = 0; i < x(e); i++) {
    let s = e[i], a = {
      [ri]: s,
      [Ul]: 1,
      [el]: !1,
      [tl]: !1,
      [xl]: !1
    };
    if (s != r || s == r && e[i + 1] == r) {
      if (H(ce(t), s) && (e[i - 1] != r || e[i - 2] == r)) {
        let n = ei(W(e, i + 1), /^\d+/);
        if (n) {
          let f = n[0];
          i += x(f), a[Ul] = +f;
        }
        a[el] = !0;
        let E = e[i + 1];
        (E == "?" || E == "+") && (a[tl] = E == "?", a[xl] = E == "+", i++);
      }
      X(l, a);
    }
  }
  return l;
}, sf = (e, t) => ys(W(e, t + 1), (l) => !l[tl]), $i = (e, t, l) => {
  let r = -1;
  if (t) {
    let i = t[ri];
    if (t[el]) {
      let s = ei(e, l[i]);
      s && (r = s.index);
    } else r = Rs(e, i);
  }
  return r;
}, ff = (e) => {
  let t = e[Jl], l = e[p], r = e[ge], i = rf(e[zl], t), s = "", a = l, n = W(l, r);
  for (let [E, f] of li(i)) {
    let c = f[ri], T = f[Ul];
    if (f[el]) {
      if (T > 0) {
        if (!a) break;
        let o = "";
        for (; a && (T > 0 || f[xl]); ) {
          let h = f[tl] || T < 1, S = $i(a, f, t), N = h && S > 0 && sf(i, +E), d = $i(a, N, t);
          if (S < 0 || d >= 0 && S > d) {
            h || (a = "");
            break;
          }
          S || (o += a[0], T--), a = W(a, 1), n == a && (r = x(s + o));
        }
        s += o, f[p] = o;
      }
    } else a && (n == a && (r = x(s)), s += c, f[p] = c, a[0] == c && (a = W(a, 1)));
  }
  e[ge] = e[ge] == 0 ? 0 : e[ge] == x(e[p]) ? x(s) : r, e[Gt] = s, e[Fl] = i;
}, nf = (e) => {
  let t = e[p], l = v(e, "decimal", "."), r = v(e, "thousands", ","), i = v(e, "precision", 2);
  l == "," && (r = "."), r == "." && (l = ",");
  let s = K(t, l), a = s[0], n = ae(a, "-");
  a = te(a, /\D/g, ""), a = a && (te(a, /^0+/, "") || "0");
  let E = x(s) > 1, f = E ? de(W(s, 1), l) : "", c = x(a), T = n ? "-" : "";
  for (let N = 0; N < c; N++)
    N > 0 && (c - N) % 3 == 0 && (T += r), T += "#";
  let o = e[Jl];
  t = n ? "-" + a : a, i > 0 && (o[l] = Jt(`\\${l}`), E && (t += l + f), T += l + "#" + i), e.mask = T, n && (o["-"] = /-/), o["#"] = /\d/;
  let h = 0, S = "";
  for (let N of e[p])
    N == t[h] ? (S += N, h++) : S += "∅";
  e[p] = S;
}, af = (e, t, l, r) => {
  let i = e.el, [s, a] = r[z], { hydrate: n, dehydrate: E } = r.$dom;
  e[fl] = !0;
  let [f, c] = Ae(K(l, " in "), Y), [T, o] = Ae(K(f, ","), Y);
  o || (o = "index");
  let h = `the ${t} ${Ie} ` + Xl;
  if (!pi(T) || !pi(o))
    return b(h, "a valid alias.");
  let S = M(e, Me(c))[0](), N = Pe(S);
  if (ur(S) && (S = Ss(S, 1)), !(ue(S) || Tt(S)))
    return b(h, `an ${lt}, ${Ct}, or ${re}.`);
  let d = Bs(i), g = J(i);
  El(i);
  let $ = {}, k = t + "-" + Je, U = t + "-" + pl, L = t + "-" + m;
  s(i, k, ([A, u]) => {
    let R = Fs(i);
    xs(R, g, d);
    let _ = r.newVNode(R);
    il(_, "", "");
    let O = $e({});
    Q(O, T, { v: u, w: !0, e: !0 }), Q(O, o, { v: A, w: !0, e: !0 }), Q(_.lc, vt, { v: O, e: !0 }), G(_, tt(O, o, ({ newValue: I }) => {
      let C = $[A][1];
      I !== C && (O[o] = C);
    })), N && G(_, tt(O, T, ({ newValue: I }) => {
      S[O[o]] = I;
    })), $[A] = [R, A], n(R);
  }), s(i, U, ([A, u]) => {
    let R = $[A], _ = r.getVNode(R && R[0]);
    if (_) {
      let O = _.lc[vt];
      O[T] = u, O[o] = A, R[1] = A;
    }
  }), s(i, L, ([A, u]) => {
    let [R] = $[A];
    E(R), Ht($, A);
  });
  let y = {
    [Je]: (A) => a(i, k, A),
    [pl]: (A) => a(i, U, A),
    [m]: (A) => a(i, L, A)
  };
  for (let A of li(S))
    y[Je](A);
  N && G(e, tt(S, "", ({ operation: A, prop: u, newValue: R }) => {
    y[A]([u, R]);
  }));
}, pi = (e) => we(e, /^[a-z_$][\w$]*$/i), Ef = async (e, t, l) => {
  let [r, i] = l[z], s = e.el;
  r(s, t, () => {
    let a = e.lc.$refs, n = ` [${t}]`, E = ut(n + Ri(Se) + Ri(Se, n), s);
    P([s, ...E], (f) => {
      let c = B(f, t);
      if (c) {
        let T = a[c];
        T ? ue(T) ? X(T, f) : a[c] = [T, f] : a[c] = f, cl(f, t);
      }
    });
  }), await i(s, t);
}, Pi = async (e, t, l, r) => {
  let [i, s] = r[z];
  l || (l = "{}");
  let a = t == Se, n = e.el, E = e.lc[a ? qt : Pl], f = a ? r[Wl] : r[Ce];
  i(n, t, async () => {
    let c = l in f ? f[l] : M(e, l, "", !1)[0];
    if (c = await c({ ...e.gc, ...e.lc }), !Tt(c))
      return e[fl] = !0, b(Zl(Ie, t, "an " + Ct, st(c)));
    for (let T in c) Q(E, T, ws(c, T));
    a && await Ef(e, "b-ref", r);
  }), await s(n, t, E);
}, mt = {}, cf = async (e, t, l, r) => {
  if (!l) return;
  let i = e.el, [s, a] = r[z];
  s(i, t, () => {
    let n = M(e, l)[0]();
    if (!ue(n) || !ar(n, De))
      return b("the", t, Ie, Ki, `an ${lt} of ${ke}(s).`);
    e.uid = n.reduce((E, f) => (f in mt ? mt[f]++ : mt[f] = 1, E[f] = mt[f], E), {});
  }), await a(i, t);
}, Tf = (e, t, l, r) => {
  r[Ye](e, t, l, (i) => {
    let s = J(i), a = Ai(i);
    return ([n]) => {
      let E = n();
      Ne(() => {
        if (E) a();
        else {
          let f = J(i);
          f && (f != s && (s = f, a = Ai(i)), i[Et]());
        }
      });
    };
  });
}, uf = (e, t, l, r) => {
  let i = Ir(e.el)[hl];
  i == "none" && (i = "block"), r[Ye](e, t, l, (s) => ([a]) => {
    let n = a();
    J(s) && Ne(() => {
      s[ne][hl] = n ? i : "none";
    });
  });
}, gi = (e) => (t, l, r, i) => {
  (r in i[ee] || e == Te) && (r = Tr(r)), i[Ye](t, l, r, (s) => async ([a]) => {
    await i.$dom[gt](a(), e, s);
  });
}, of = (e, t, l, r) => {
  nl(l) || (l = Me(l, "$controls", !0)), r[Ye](e, t, l, () => async ([i], s) => {
    await i(s);
  });
}, yf = (e, t, l, r) => {
  let i, s;
  try {
    i = D(l), ft(i) && (l = Me(cr(l)));
  } catch {
  }
  r[Ye](e, t, l, (a) => ([n]) => {
    try {
      let E = n();
      ue(E) ? [i, s] = E : i = D(E);
    } catch {
    }
    H([Le, pe, Kr, Yl], s) || (s = pe), ft(i) ? le(i, s, a) : Sr(Vi, xe, ht, t + `="${l}"`);
  });
}, Ci = 1 / 0, Sl = (e) => (t, l, r, i) => {
  let s = t[Qe][gl] ? gl : t[Qe][Ft] ? Ft : "";
  if (!s)
    return b("the", l, Ie, Ki, "accompanied by an b-if or", Ft, Ie);
  let [a] = i[z], [n, E] = i[Ot], f = M(t, r)[0]();
  f[$l](), (e == qi || e == Il) && a(t.el, s, (c, T) => n(f, c, T), Ci), (e == Yi || e == Il) && a(t.el, s, (c, T) => E(f, c, T), -Ci);
}, ot = (e) => async (t, l, r = {}) => {
  let i = "status", s = v(r, "parser");
  H([pt, m], e) && Tt(l) && (t += _s(l), l = rt);
  try {
    let a = await fetch(t, { ...r, [xr]: e, body: l });
    if (!a.ok) {
      let E = new Error(`HTTP ${Nl}! ${i}: ${a[i]}`);
      throw E.response = a, E;
    }
    let n = await a[s || Te]();
    if (!s)
      try {
        n = ti(n);
      } catch {
      }
    return n;
  } catch (a) {
    throw a;
  }
}, ll = {
  get: ot(pt),
  post: ot(Yr),
  put: ot(ji),
  [ai]: ot(ai),
  [m]: ot(m)
}, Af = async (e, t, l, r) => {
  let i = e.el, s = r[V], a = Oe(i) == V;
  e.skip = a;
  let [n, E] = r[z], f = l ? s[l] || M(e, l)[0]() : [];
  f = Ae(
    ue(f) ? f : [f],
    (c) => s[c] || c
  ), n(i, t, async () => {
    if (a) {
      let T = B(i, "src");
      T && Cr.add(T);
      let o = T ? await ll.get(T) : Or(i) || "0";
      X(f, $t(o)), El(i);
    }
    let c = { ...e.gc, ...e.lc };
    for (let T of f) {
      let o = T;
      bt(o) || (o = M(e, o, "", !nl(o))[0]), await o(c);
    }
  }), await E(i, t);
}, Rf = (e, t, l, r) => {
  let i = e.el;
  if (Oe(i) != ne) {
    let [s, a] = r[z], n = r[ne], E = n[l] ? n[l]() : M(e, l)[0]();
    E = Ae(
      ue(E) ? E : [E],
      (c) => n[c] ? n[c]() : c
    );
    let f = Ar();
    s(i, t, () => {
      Ys(i, f);
      let c = ii(ne);
      c[He] = Sf(de(E, Z), "." + f), r.$dom[Pt](c, i), le(i, pe, c);
    }), a(i, t, f);
  }
}, Sf = (e, t) => {
  e = te(e, /\/\*[\s\S]*?\*\//g, ""), e = wr(e);
  let l = [], r = Ar();
  for (; we(e, Wt); ) {
    let E = ei(e, Wt);
    E && (X(l, E[0]), e = te(e, Wt, r));
  }
  let i = et(K(e, "}"), Y), s = Z + "    ", n = de(Ae(i, (E) => {
    let [f, c] = K(E, "{"), T = Ae(
      Ae(K(f, ","), Y),
      (o) => H(o, "&") ? te(o, /&/g, t) : t + " " + o
    );
    return c = de(Ae(et(K(c || "", Z), Y), Y), s), de(T, ",") + ` {${s + c + Z}}`;
  }), Z);
  return P(l, (E) => {
    n = te(n, r, E);
  }), n;
}, df = async (e, t, l) => {
  e.skip = !l || !!await M(e, l)[0]();
}, Of = (e, t, l, r) => {
  let i = e.el, s = r[ee][l] ? r[ee][l]() : M(e, l)[0](), [a, n] = r[z];
  a(i, t, async () => {
    await r.$dom[gt](s, rl, i), le(i, jt, ...fe(i));
  }), n(i, t);
}, dl = (e) => Jt(`^(${e})[\\w-]+$`), If = [
  // IMPORTANT: The `b-ignore` directive must be hydrated first because it stops the hydration of the element and its children.
  ["b-ignore", df],
  // IMPORTANT: The `b-each` directive must be hydrated second because it hydrates other directives for each item it iterates over.
  [qr, af],
  // Context-related directives
  [ir, Pi],
  [Se, Pi],
  ["b-uid", cf],
  [w + it, gi(rl)],
  [w + Te, gi(Te)],
  [w + ee, Of],
  [w + V, Af],
  [w + ne, Rf],
  // IMPORTANT: The `b-teleport` directive must be hydrated before the `b-if` directive because `b-if` restores the element to its original position.
  [w + Vi, yf],
  // Conditional directives: These directives usually depend on values from the context
  [gl, Tf],
  [Ft, uf],
  // ['b-boost', hydrateBoost],
  [w + Ot, Sl(Il)],
  // b-transition
  [w + Ot + "-in", Sl(Yi)],
  // b-transition-in
  [w + Ot + "-out", Sl(qi)],
  // b-transition-out
  // b-on: used to create event listeners. Including special listeners such as `on-enter`, `on-exit`, and `on-resize`
  [dl("b-on-|on-"), Qs],
  // [b-on|on]-[eventName]-[...eventAlias]
  /**
   * Data binding directives
   * Used to bind data to an element's property or attribute
   * 
   * - The `b-model` directive is used to create a two-way data binding between an input value and a reactive property.
   * - The `b-mask` directive is used to format an input value using a mask.
   * - The `b-bind-|bind-` directive is a general directive used to bind data to an element property or attribute.
   */
  [dl("b-bind-|bind-"), Js],
  // [b-bind|bind]-[...attributeNames]
  ["b-model", tf],
  ["b-mask", lf],
  /**
   * b-effect: used to create one or more effects that run when their dependencies change.
   * It is perfect for small expressions, reactive or not.
   * Example: console.log(`Hello, ${$data.name}!`)
   */
  [dl("b-effect"), of]
  // b-effect-[effectAlias]
], _f = (e, t, l) => async (r, i, s, a) => {
  let n = i == ql ? St : i == rl ? j : i == Te ? He : i == Le ? Le + ul : i == "first" ? pe + ul : i == "last" ? Le + xt : i == pe ? pe + xt : i, E = "$dom." + gt, f = D(s), c = D(mr), T = D(Hr);
  if (!f) return b(E, xe, ht);
  (c == f || T == f) && (n = j);
  let o = D(it) == f, h = n == He, S = h || n == j, N = n == St, d = S ? f : J(f);
  if (!d && !o) return b(E, sl, xe, ht);
  r = await r, r in l && (r = l[r]());
  let g = ft(r) ? r : Ks(r), $ = v(a, q);
  $ && (r = D($, g)), ft(r) && (r = r[St]), (N || o) && t(f, !1), S && P(fe(f), (y) => t(y));
  let k = new Set(fe(f));
  d && P(fe(d), (y) => k.add(y));
  let U = (y) => et(fe(y), (A) => !k.has(A)), L = [];
  o ? (f[j] = D(it, g)[j], L = [f, ...ut(V, f)]) : S ? (f[h ? He : j] = r, L = fe(f)) : N ? (f[St] = r, L = U(d)) : (Us(f, n, r), L = U(n == Le + ul || n == pe + xt ? d : f)), Vl(L, (y, A) => {
    let u = Oe(y) == ne, R = Oe(A) == ne;
    return u && !R ? -1 : R && !u ? 1 : 0;
  }), P(L, (y) => {
    if (
      // is script element
      Oe(y) == V && // is not b-script
      Ee(B(y, w + V)) && // should load: !(b-load-once attribute AND script already loaded)
      !(!Ee(B(y, "b-load-" + zi)) && Cr.has(B(y, "src")))
    ) {
      let A = ii(V);
      Ll(y, (u, R) => Vt(A, u, R, _r(u) && u)), A[j] = y[j], le(y, jt, A);
    }
  }), v(a, Pt, !0) && P(L, (y) => e(y, f));
}, hf = (e, t, l) => [
  // Set a route
  (r, i) => {
    if (bt(i)) {
      r = Yt(r, ol);
      let s = et(K(r, "/"), Y), a = x(s) - 1, n = e;
      P(s, (E, f) => {
        E in n || (n[E] = {}), n = n[E], f == a && (n[dt] = i);
      });
    } else b(Hi, "set route without a route", wt, Z, r);
  },
  /**
   * Route to a path.
   * 
   * Notes:
   * - If the path matches a route, the route function is called with the params and path. Otherwise, the page is fetched and swapped.
   * - If the path is not on the same origin, a redirect is performed.
   * 
   * @returns `null` if redirected, `true` if the route was found, or `false` if the route was not found
   */
  (r) => {
    if (!ae(Yt(r), Bt.origin))
      return Bt.href = r, Fe;
    r = Yt(r, ol);
    let i = et(K(r, "/"), Y), s = e, a = {}, n = 0;
    for (let E of i) {
      if (n = 0, E in s && !ae(E, ":"))
        s = s[E], n = 1;
      else for (let f of ce(s))
        if (ae(f, ":")) {
          let [c, T] = et(K(f, ":"), Y);
          if (!T || T && T in t && t[T](E)) {
            let o = a[c];
            o ? ue(o) ? X(o, E) : a[c] = [o, E] : a[c] = E, s = s[f], n = 1;
            break;
          }
        }
      if (!n) break;
    }
    return n = n && s[dt] ? 1 : 0, n ? s[dt]({
      params: a,
      path: r,
      [Et]: () => Ht(s, dt)
    }) : l(ll.get(r), ql, it), r != Bt[ol] && history.pushState(Fe, "", r), !!n;
  }
], Nf = [], $f = () => {
  let e = he(), t = (l, r) => {
    let i = Nf.find((s) => s[Wr](l));
    if (i)
      return e.has(l) || i[Br](l, () => {
        e.get(l)();
      }), e.set(l, r), i;
    b(Lr, ht, Z, l);
  };
  return [
    /**
     * Plays the animation towards the end
     * 
     * When used with $hook, this function is usually called before the main hook function
     * 
     * This allows the animation to transition the element out of view
     */
    (l, r = !1, i) => {
      let s = v(i, Ei, () => {
      }), a = v(i, $l, () => {
      });
      !e.has(l) && !r && s();
      let n = t(l, s);
      !n || r ? s() : (a(), n.play(l, s));
    },
    /**
     * Plays the animation towards the start (in reverse)
     * 
     * When used with hook, this function is usually called after the main hook function
     * 
     * This allows the animation to transition the element into view
     */
    (l, r = !0, i) => {
      let s = v(i, Ei, () => {
      }), a = v(i, $l, () => {
      }), n = t(l, s);
      n && r ? (a(), n[Ji](l, s)) : s();
    }
  ];
}, wi = (e, t, l) => {
  let r = e.get(t);
  return r && r[l];
}, pf = (e) => [
  // Adds a hook to a target
  (t, l, r, i = 0) => {
    e.has(t) || e.set(t, {}), e.get(t)[l] || (e.get(t)[l] = he()), wi(e, t, l).set(r, i);
  },
  // Calls all the functions under a hook name on a target by priority
  async (t, l, r) => {
    let i = wi(e, t, l);
    if (i && x(i)) {
      let s = ct(i);
      Vl(s, Er);
      let a = -1, n = !0, E = async () => {
        if (a++, n = !0, a < x(s)) {
          let f = a;
          await s[f][0](
            /** Contextual data, if any */
            r,
            {
              /** Call the next function */
              play: E,
              /** Disable the auto-run feature and choose when/if to call the next function */
              pause: () => n = !1,
              /** Remove the current function */
              [Et]: () => i[m](s[f][0])
            }
          ), n && await E();
        }
      };
      await E();
    }
  }
], dt = Symbol(), Nt = {}, Cr = /* @__PURE__ */ new Set(), Pf = (e, t) => {
  let l = he(), r = "\\p{Letter}", i = $e({
    [oi]: ie({ number: Os }),
    mask: ie({ money: nf }),
    [rr]: ie({
      "#": /\d/,
      // only numbers
      "&": Jt(`[${r}]`, "u"),
      // only letters (unicode)
      "*": Jt(`[${r}\\d]`, "u")
      // letters and numbers (unicode)
      // H: /[a-f\d]/i, // hexadecimal
    }),
    [Ie]: ie([...If]),
    [ee]: ie({}),
    [V]: ie({}),
    [ne]: ie({}),
    [Ce]: ie({}),
    data: ie({})
  }), s = {
    $http: ll,
    [br]: i,
    $state: $e,
    $watch: tt,
    $effect: Kt
  }, a = (y) => l.get(y), n = (y, A = () => !0) => {
    let u = y ? J(y) : Fe;
    for (; u; ) {
      let R = a(u);
      if (R && It(R[Qe]) && A(R)) return R;
      u = J(u);
    }
  }, E = (y, A) => {
    let u = a(y);
    if (!u) {
      let R = A ? a(A) : n(A || y);
      u = {
        // Local context
        // @ts-ignore
        lc: {},
        // Global context
        gc: s,
        // A reference to the element. Convenience for internal use.
        el: y,
        // UID context
        uid: v(R, "uid", {}),
        /** Attributes or directives */
        attr: {},
        /** Cleanup functions */
        cFns: []
      };
      for (let _ in Ol) {
        let O = Ol[_](u, R);
        O && Q(u.lc, _, { v: O, e: !0 });
      }
      l.set(y, u);
    }
    return u;
  }, f = (y, A, u, R) => {
    let _ = y.el;
    N(_, A, R(_));
    let O = M(y, u);
    G(y, Kt(() => d(_, A, O)));
  }, c = (y, A) => {
    De(y) && (y = D(y)), De(A) && (A = D(A)), ft(A) || (A = rt), ft(y) && (kr(y, L), Hl(y, async (u) => {
      let R = !1, _ = y == u ? A : rt;
      if (Ps(u) && Or(u))
        R = o(u, _);
      else if (nt(u))
        if (Oe(u) == ee) {
          let I = ii("div");
          Ll(u, (C, ye) => Vt(I, C, ye)), I[j] = u[j], le(u, jt, I), c(I, _), Ne(() => le(I, jt, ...fe(I)));
        } else
          R = await h(u, _);
      return R;
    }));
  }, T = (y, A = !0, u = !0) => {
    Hl(y, (R) => {
      let _ = a(R);
      return _ && (P(_.cFns, (O) => O()), u && l[m](R), A && El(R)), !0;
    });
  }, o = (y, A) => {
    let u = y[He], R = wr($t(u || ""));
    if (R && we(R, Wt)) {
      let _ = E(y, A), [O] = M(_, `$el.${He}=${Tr(R)}`, "", !0);
      G(_, Kt(O)), il(_, Te, u);
    }
    return !1;
  }, h = async (y, A) => {
    let u = E(y, A);
    if (!Be(yt(u))) return !0;
    u[_e] = gf(u, w + _e)();
    for (let [R, _] of i[Ie]) {
      let O = [];
      if (ps(R))
        Ll(y, (I, C) => {
          we(I, R) && X(O, [I, C]);
        });
      else {
        let I = B(y, R);
        Ee(I) || X(O, [R, I]);
      }
      for (let [I, C] of O) {
        if (yt(u)) break;
        il(u, I, C), await _(u, I, $t(C), L);
      }
      if (yt(u)) break;
    }
    return Be(yt(u)) && (u.skip = !1), !It(u[Qe]) && !A && l[m](y), !yt(u);
  }, S = _f(c, T, i[ee]), [N, d] = pf(he()), [g, $] = hf({}, i[oi], S);
  Nt[Ve] || bi($);
  let k = {
    hook: N,
    // -> $hook
    [Ve]: g,
    // -> $route
    router: bi
    // -> $setRouter
  }, U = {
    [Pt]: c,
    [Zr]: T,
    [gt]: S,
    [Ve]: $,
    emit: me,
    listen: Re,
    query: D,
    queryAll: ut,
    /** Get the closest parent element of a target element */
    closest(y, A = Se) {
      let u = n(D(y), (R) => A in R[Qe]);
      return u || b("closest:", xe, ht), u == null ? void 0 : u.el;
    },
    /** Get the local context of an element */
    context: (y) => {
      var A;
      return (A = a(D(y))) == null ? void 0 : A.lc;
    }
  };
  s.$set = k, s.$dom = U, Nt[Fi] = `{${de(ce(s))},${de(ce(Ol))}}`;
  let L = {
    ...s,
    ...i,
    newVNode: E,
    getVNode: a,
    eval: M,
    [Ye]: f,
    [z]: [N, d],
    [Ot]: $f()
  };
  return P([k, U, ll, i, s, L], (y) => bs(y, { w: !1, c: !1 })), De(e) && (e = D(e)), e && (nt(e) && Ee(B(e, Se)) && Vt(e, Se, ""), c(e, t)), s;
}, yt = (e) => e.skip, G = (e, t) => {
  X(e.cFns, t);
}, il = (e, t, l) => {
  e[Qe][t] = l, nt(e.el) && cl(e.el, t);
}, $t = (e) => te(Y(de(K(e, Z).map((t) => ae(Y(t), "//") ? "" : t), Z)), /;$/, ""), Wt = /\${((?!.*\${).*?)}/, wr = (e) => {
  let t = /{{((?!.*{{).*?)}}/;
  for (; we(e, t); )
    e = te(e, t, "${$1}");
  return e;
}, kr = (e, t) => {
  let l = w + "save";
  if (!nt(e)) return;
  let r = ut(ee + `,[${l}]`, e);
  (B(e, l) || Oe(e) == ee) && X(r, e), P(r, (i) => {
    let s = B(i, l);
    cl(i, l);
    let a = Oe(i);
    if (a == ee && P(fe(i.content), (n) => kr(n, t)), s) {
      let n = a == V ? V : a == ne ? ne : ee, E = $t(i[j]);
      t[n][s] = a == V ? E : () => E, Ee(B(i, w + Pt)) && El(i);
    }
  });
}, ki = (e, t, l) => (r, i) => {
  let s = i ? i.lc[e] : Fe;
  return nt(r.el) && (!s || !Ee(B(r.el, t))) ? $e({}, { [sl]: l && s }) : s || {};
}, Ol = {
  // The element itself
  $el: (e) => e.el,
  // References to `b-ref` elements under the same $data context, not including nested $data contexts
  $refs: (e, t) => !t || nt(e.el) && !Ee(B(e.el, Se)) ? {} : t.lc.$refs,
  // Unique identifier for the element
  $uid: (e) => (t) => `${t}-${e.uid[t]}`,
  // Reactive properties defined in the element or inherited from the parent context
  [Pl]: ki(Pl, ir, !0),
  // The $data context
  [qt]: ki(qt, Se),
  // The $each context
  [vt]: (e, t) => t == null ? void 0 : t.lc[vt]
}, bi = (e) => {
  bt(e) && (Nt[Ve] = () => e(Yt()));
}, gf = (e, t, l = "{}") => {
  let r = $t(B(e.el, t) || l);
  return il(e, t, r), M(e, r, "", !1)[0];
}, Cf = () => {
  if (!(Tl in be)) {
    let e = {};
    Q(e, "newApp", { v: Pf }), Q(be, Tl, { v: e }), Re(be, jl, ef), Re(be, "pop" + se, Nt[Ve]), me(be, Tl);
  }
};
Cf();
export {
  Pf as newApp
};
