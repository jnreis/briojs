let Zt = "brio", Le = "$", Bl = "$refs", kl = "$slots", Nr = "$store", Fs = "$tools", Ut = "after", sl = "append", ut = "array", Pe = "attr", ni = "Attribute", Ar = "a valid", H = "b-", De = "b-if", mr = "b-ignore", ci = "b-ref", wr = "b-save", bt = "b-show", Ir = "b-slot", ml = "before", Bs = "body", el = "boolean", Pr = "can only be used on", dr = "Cannot ", st = "checkbox", nt = "checked", Cr = "class", Dr = "clone", Ei = "composi", oi = "content", gr = "Content", Tt = "create", yt = "data", al = "debounce", $r = "detail", Lr = "define", Y = "delete", Je = "directive", Hl = "disconnect", fl = "display", ui = "document", xr = "each", He = "element", tl = "email", Mr = "end", Bi = "entries", ki = "error", Ze = "evalEffect", Hi = "event", vr = "EventListener", Ur = "exit", be = "get", Fr = "head", Yi = "href", Ti = "html", pi = "HTML", Ri = "hydrate", je = "index", ks = "inner", Hs = "insert", nl = "Invalid", Yl = "length", St = "mask", Br = "message", Ys = "method", _e = "must be", oe = `
`, ot = "newValue", kr = "name", cl = "Node", Ce = "nodes", Hr = "not found.", Ot = null, ne = "number", Wt = "object", Yr = "observe", It = "oldValue", hi = "on-", zi = hi + "enter", Ki = hi + Ur, Gi = hi + "resize", zs = "once", yi = "operation", se = "options", Ks = "outer", wl = "parent", Wi = "patch", Gs = "post", zl = "prepend", zr = "prevent", Kr = "Propert", et = Kr + "y", Ae = "props", Gr = "put", ji = "radio", tt = "remove", Si = "replace", Oi = "requires", El = "route", ce = "script", le = "skip", j = "select", Ee = "state", Wr = "start", _i = "storage", Ue = "string", b = "style", jr = "super", qr = "teleport", Ne = "template", ie = "text", qi = "throttle", Ni = "tion", Ws = "toString", ol = "tokens", Et = "transition", Vr = "type", Te, Xr = "update", Qr = "valid", d = "value", Ai = "With", js = "add" + vr, Kl = Le + yt, jt = "$de" + Ri, Ft = Le + xr, qt = Le + Ri, Il = Le + Hs, Gl = Le + Ae, ze = H + yt, Jr = H + xr, Zr = H + Ti, mi = H + ce, wi = H + Ne, qs = H + ie, Vs = Cr + "List", Xs = Dr + cl, ul = Ei + "ng", Qs = Ei + Ni + Wr, Js = Ei + Ni + Mr, Zs = Tt + "Comment", bs = Tt + "Element", Wl = Lr + et, ea = Lr + Kr + "ies", Vi = Y + et, br = Je + "s", ta = "ends" + Ai, Pl = "func" + Ni, la = be + ni, ia = be + et + "Value", ra = be + et + "Priority", Xi = Fr + "ers", Dt = ks + pi, W = "in" + Gr, Tl = St + "s", es = St + "Token", pl = es + "s", Rl = "of " + Vr, ts = Ks + pi, ls = "Own" + et, sa = wl + cl, hl = "path" + kr, aa = zr + "Default", is = "proto" + Vr, fa = tt + ni, na = tt + vr, ca = tt + et, gt = Si + Ai, Pt = Si + "Children", Qi = El + "Rule", Ml = j + "ionStart", Ea = j + "or", oa = "set" + ni, ua = "set" + et, Ta = Wr + "s" + Ai, pa = _i + "Area", we = "tar" + be, ct = ie + "area", pt = ie + gr, Ra = Qr + "ate", ha = Qr + "ator", ya = "async" + Pl, rs = be + ls + "Descriptor", Sa = rs + "s", Oa = "has" + ls, ss = (e, t, l, i) => `the ${e} ${t} ${Oi} ${l}, ` + as(i), as = (e) => `but got ${e} instead.`, L = (e, ...t) => e.push(...t), _a = (e, t) => e.sort(t), re = (e, t) => e.join(t), D = (e, t) => e.forEach(t), q = (e, t, l) => e.map(t, l), $t = (e, t, l) => e.filter(t, l), Ii = (e, t, l) => e.find(t, l), Pi = (e, t, l) => e.every(t, l), di = (e, t, l) => e.some(t, l), Na = (e, t, l) => e.indexOf(t, l), Aa = (e, t) => t[1] - e[1], Xe = (e) => Array.from(e), Ji = (e, t = 0) => q(Xe({ [Yl]: e }), (l, i) => t + i), k = (e) => e.trim(), ge = (e) => e.toLowerCase(), K = (e, t, l) => e.split(t, l), dl = (e, t) => e.match(t), fs = (e) => e.toUpperCase(), ma = (e) => fs(e[0]) + Q(e, 1), wa = (e) => ge(e[0]) + Q(e, 1), Ke = (e, t, l) => e[Ta](t, l), Zi = (e, t, l) => e[ta](t, l), pe = (e, t) => t.test(e), ee = (e, t, l) => e[Si](t, l), jl = (e, t, l) => {
  for (; pe(e, t); )
    e = ee(e, t, l);
  return e;
}, Ia = (e) => pe(e, /^\d+$/), Pa = (e) => pe(e, /^(\w|\s|\.|\$|`|'|"|(\[(.|\s)+?\]))*;?$/g) && !Ke(e, Y + " "), ns = (e) => pe(k(e), /^((async\s+)?function\s*\([^)]*\)\s*{[^}]*}|(async\s*)?(?:\([^()]*\)|[$\w]+)\s*=>)/), da = (e) => wa(re(q(K(e, "-"), ma), "")), cs = (e) => JSON.stringify(e), Ci = (e, t) => {
  try {
    e = JSON.parse(e, t);
  } catch {
  }
  return e;
}, Es = (e) => "`" + ee(e, /`/g, "\\`") + "`", Oe = (...e) => re(e, " "), Rt = (e) => ge(Q(de[is][Ws].call(e), 8, -1)), lt = (e, t) => Rt(e) === t, ue = (e) => e === Ot, Bt = (e) => e === Te, Re = (e) => lt(e, Wt), U = (e) => lt(e, ut), Di = (e) => Ca(e) || Da(e), Ca = (e) => lt(e, Pl), Da = (e) => lt(e, ya), V = (e) => lt(e, Ue), kt = (e) => lt(e, ne) && isFinite(e), ga = (e) => lt(e, el), $a = (e) => _t(e, os), _t = (e, t) => e instanceof t, qe = (e) => _t(e, Node), La = (e) => _t(e, Text), xe = (e) => _t(e, HTMLElement), ql = (e) => _t(e, Map), Vl = (e) => _t(e, Set), Fe = window, de = Object, mt = Reflect, yl = location, Nt = Fe[ui], xa = Symbol, os = RegExp, G = (e, t) => de[is][Oa].call(e, t), $e = (e, t, l) => {
  let i = l;
  try {
    i = t in e ? e[t] : l;
  } catch {
  }
  return i;
}, it = (e, t) => delete e[t], Ma = [
  ["w", "writable"],
  ["e", "enumerable"],
  ["c", "configurable"]
], X = (e, t, l = Te, i = {}) => {
  let f = "";
  V(i) && (f = i, i = {}), D(Ma, ([n, s]) => {
    G(i, n) ? i[s] = i[n] : G(i, s) || (i[s] = !v(f, n));
  }), i[d] = l, de[Wl](e, t, i);
}, Lt = (e) => C(Ie(e)), Ie = (e) => de.keys(e), va = (e = Ot) => de[Tt](e), Ua = (e, t = {}) => {
  const l = va(e);
  return de[ea](
    l,
    de[Sa](t)
  ), l;
}, Fa = (e, t, l = de) => l[rs](e, t), Ba = (e) => de.getPrototypeOf(e), gi = (e, t = {}) => {
  D(Ie(e), (l) => {
    X(e, l, e[l], t);
  });
}, $i = (e) => D(Ie(e), (t) => {
  it(e, t);
}), Me = (e = Te) => new Map(e), Qe = (e = Te) => new Set(e), us = (e, t) => new os(e, t), xt = (e, t) => {
  if (e === t) return e;
  if (U(e) && U(t)) {
    for (; C(e) > C(t); ) e.pop();
    for (let l = 0; l < C(t); l++)
      l < C(e) ? e[l] = xt(e[l], t[l]) : e.push(Be(t[l]));
  } else if (ql(e) && ql(t)) {
    let l = Me(e);
    e.clear();
    for (let [i, f] of rt(t))
      e.set(i, l.has(i) ? xt(l.get(i), f) : Be(f));
  } else if (Vl(e) && Vl(t)) {
    e.clear();
    for (let l of t)
      e.add(l);
  } else if (Re(e) && Re(t)) {
    let l = { ...e };
    $i(e);
    for (let i in t)
      G(t, i) && (e[i] = G(l, i) ? xt(l[i], t[i]) : Be(t[i]));
  } else
    return t;
  return e;
}, Be = (e) => {
  let t = e;
  if (Re(e)) {
    let l = {};
    for (let i in e)
      G(e, i) && (l[i] = Be(e[i]));
    t = l;
  }
  return U(e) && (t = q(e, Be)), ql(e) && (t = Me(q(Xe(rt(e)), ([l, i]) => [l, Be(i)]))), Vl(e) && (t = Qe(q(Xe(e), Be))), t;
}, v = (e, t, l) => e.includes(t, l), rt = (e) => Re(e) ? de[Bi](e) : e[Bi](), Q = (e, t, l) => e.slice(t, l), C = (e) => Bt(e[Yl]) ? e.size : e[Yl], Cl = (e, t = 0) => setTimeout(e, t), ka = (e) => {
  clearTimeout(e);
}, Sl = (e, t) => {
  let l;
  return (...i) => {
    ka(l), l = Cl(() => e(...i), t);
  };
}, Ha = (e, t) => {
  let l = 0;
  return (...i) => {
    let f = Date.now();
    if (!(f - l < t))
      return l = f, e(...i);
  };
}, bi = {}, er = (e) => Q(ee(crypto.randomUUID(), /-/g, ""), 0, e - 1), At = (e = 8) => {
  let t = er(e);
  for (; t in bi; ) t = er(C(t) + 1);
  return bi[t] = !0, "b" + t;
}, Ts = (e, ...t) => console[e]("Brio.js", ...t), Dl = (...e) => Ts("warn", "warn:", oe, ...e), x = (...e) => Ts(ki, `detected an ${ki}:`, oe, ...e), Li = (e, t = Nt) => Xe(t.querySelectorAll(e)), te = (e, t = Nt) => V(e) ? Li(e, t)[0] : e, Ge = (e, t, ...l) => e[t](...l), ps = (e) => e[Xs](!0), Rs = (e, t) => D(Xe(e.attributes), ({ name: l, [d]: i }) => t(l, i)), Ht = (e) => e[tt](), Ol = (e) => e[sa], hs = (e) => k(e[pt] || ""), ll = (e) => [...e.childNodes], ae = (e, t) => e[la](t), xi = (e, t, l, i) => {
  i && (e[i] = l), e[oa](t, l);
}, Mi = (e, t) => e[fa](t), Ya = (e, ...t) => e[Vs].add(...t), tr = requestAnimationFrame, Ye = (e) => tr(() => tr(e)), Xl = (e, t) => Nt[bs](e, t), ys = (e) => Nt[Zs](e), We = (e) => ge(e.tagName || ""), me = (e, t, l, i) => (e = te(e), e[js](t, l, i), () => e[na](t, l)), Ve = (e, t, l) => te(e).dispatchEvent(new CustomEvent(ge(ee(t, /[^a-z\d]/gi, "")), {
  bubbles: !0,
  cancelable: !0,
  [$r]: l
})), _l = async (e, t, l = !1) => {
  if (await t(e))
    for (let i of ll(l && We(e) == Ne ? e[oi] : e))
      await _l(i, t, l);
}, za = (e) => e[we][ul] = !0, Ka = (e) => {
  let t = e[we];
  t[ul] && (t[ul] = !1, Ve(t, W));
}, Ss = (e) => Fe.getComputedStyle(e), Ga = (e) => {
  let t = Ss(e);
  return !(!Ol(e) || t[fl] == "none" || t.visibility == "hidden" || t.opacity == "0");
}, Yt = (e = "", t = Yi) => new URL(e, yl[Yi])[t], Os = (e) => Ke(Yt(e), yl.origin), _s = (e) => v(["src", d, nt, j + "ed"], e), Wa = (e) => ee(ee(e, /[^a-z0-9_-]/gi, ""), /^[^a-z_]+/i, ""), Ns = (e) => {
  let t = {};
  for (let l of e)
    t[l] = [e[ia](l), e[ra](l)];
  return t;
}, lr = (e) => {
  let t = {}, l = {};
  for (let i in e)
    (Ke(i, Et) ? t : l)[i] = e[i];
  return [t, l];
}, ir = (e) => {
  for (let t of document.styleSheets)
    try {
      for (let l of t.cssRules)
        if (l.selectorText == e)
          return Ns(l[b]);
    } catch {
    }
}, ja = (e, t, l, i) => {
  e[b][ua](t, l, i);
}, qa = (e, t) => {
  e[b][ca](t);
}, fe = (e, ...t) => {
  for (let l of t)
    for (let i in l)
      ja(e, i, ...l[i]);
}, Se = (e, ...t) => {
  for (let l of t)
    for (let i in l)
      qa(e, i);
}, rr = (e) => `only supports ${re(Q(e, 0, -1), ", ")}, and ${e[C(e) - 1]} insertions`, Va = (e) => async (t, l, i, f) => {
  let n = Il + ":", s = l == ie ? pt : l, a = [ml, Ut, zl, sl, gt, Pt, ie], c = () => di(a, (I) => I == l);
  if (!c())
    return x(n, rr(a));
  let r = te(t);
  if (!qe(r))
    return x(n, we, _e, Rl, cl);
  if (te(Ti) == r)
    return x(n, we, "cannot be the", pi, He);
  if (a = [Pt, zl, sl], (te(Fr) == r || te(Bs) == r) && !c())
    return x(n, fs(We(r)), He, rr(a));
  i = await i;
  let E = e[Ne];
  i in E && (i = E[i]);
  let o = s == pt, u = i, y = !1;
  if (!o && V(i) && (u = Xl("div"), u[Dt] = i, y = !0), !o && !qe(u))
    return x(n, oi, _e, Rl, cl, "or", Ue);
  let p = $e(f, Ea);
  if (!o && p && V(p) && (u = te(p, u), !qe(u)))
    return x(n, He, Hr);
  let h = e.gc[jt];
  if (s == gt) await h(r, !1);
  else if (o || s == Pt)
    for (let I of ll(r)) await h(I, !1);
  let S = y ? ll(u) : [u];
  if (Ge(r, o ? Pt : s, ...S), o && (S = ll(r)), D(S, (I) => {
    let P = [];
    We(I) == ce ? L(P, I) : xe(I) && L(P, ...Li(ce, I)), D(P, (F) => {
      if (Pi([mi, mr, wr, Ir], (z) => ue(ae(F, z)))) {
        let z = Xl(ce);
        Rs(F, (_, J) => xi(z, _, J, _s(_) && _)), z[Dt] = F[Dt], Ge(F, gt, z);
      }
    });
  }), $e(f, Ri, !0)) {
    let I = e.bnode[0];
    for (let P of S) {
      if (xe(P)) {
        let F = I(P, r);
        await xl(F);
      }
      await e.gc[qt](P, r);
    }
  }
  return S;
}, vl = (e, t = "", l = "") => {
  let i = t == yt ? FormData : URLSearchParams, f = new i(), n = (s, a = "") => {
    Re(s) || U(s) ? D(rt(s), ([c, r]) => {
      let E = a ? `${a}[${c}]` : c;
      n(r, E);
    }) : f[sl](a, s);
  };
  return n(e, l), f;
}, wt = (e) => async (t, l, i = {}) => {
  let f = "status", n = gr + "-Type", s = $e(i, "parser");
  if (Re(l)) {
    let a = i[Xi] || {}, c = Ii(Ie(a), (E) => ge(E) == ge(n)), r = ge(a[c] || "");
    it(a, c), e == be || e == Y ? (t += vl(l), l = Te) : Zi(r, "json") ? (l = cs(l), a[n] = "application/json") : Zi(r, "form-data") ? l = vl(l, yt) : l = vl(l), i[Xi] = a;
  }
  try {
    let a = await fetch(t, { ...i, [Ys]: e, body: l }), c = await a[s || ie]();
    if (!s)
      try {
        c = Ci(c);
      } catch {
      }
    if (!a.ok) {
      let r = new Error(`HTTP ${a[f]}! Status text: ` + a.statusText);
      throw r.response = a, r[oi] = c, r;
    }
    return c;
  } catch (a) {
    throw a;
  }
}, Ql = {
  get: wt(be),
  post: wt(Gs),
  put: wt(Gr),
  [Wi]: wt(Wi),
  [Y]: wt(Y)
}, Xa = (e, t) => [
  // Set a route
  (l, i) => {
    if (Di(i)) {
      l = Yt(l, hl);
      let f = $t(K(l, "/"), k), n = C(f) - 1, s = e;
      D(f, (a, c) => {
        a in s || (s[a] = {}), s = s[a], c == n && (s[Ct] = i);
      });
    } else x(dr, "set route without a", El, Pl, oe, l);
  },
  /**
   * Get a route function by path.
   * 
   * @returns The route function, or `undefined` if not found, or `null` if not the same origin
   */
  (l) => {
    if (!Os(l))
      return Ot;
    l = Yt(l, hl);
    let i = $t(K(l, "/"), k), f = e, n = {}, s = 0;
    for (let a of i) {
      if (s = 0, a in f && !Ke(a, ":"))
        f = f[a], s = 1;
      else for (let c of Ie(f))
        if (Ke(c, ":")) {
          let [r, E] = $t(K(c, ":"), k);
          if (!E || E && E in t && t[E](a)) {
            let o = n[r];
            o ? U(o) ? L(o, a) : n[r] = [o, a] : n[r] = a, f = f[c], s = 1;
            break;
          }
        }
      if (!s) break;
    }
    if (s = s && f[Ct] ? 1 : 0, s)
      return () => f[Ct]({
        params: n,
        path: l,
        [tt]: () => it(f, Ct)
      });
  }
], As = (e, t) => {
  e = Yt(e, hl), t && Os(e) ? (t(), e != yl[hl] && history.pushState(Ot, "", e)) : yl.href = e;
};
const Qa = Qe([
  // ECMAScript reserved keywords
  "break",
  "case",
  "catch",
  Cr,
  "const",
  "continue",
  "debugger",
  "default",
  Y,
  "do",
  "else",
  "export",
  "extends",
  "finally",
  "for",
  "function",
  "if",
  "import",
  "in",
  "instanceof",
  "let",
  "new",
  "return",
  jr,
  "switch",
  "this",
  "throw",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "yield",
  "enum",
  "await",
  "implements",
  "package",
  "protected",
  "interface",
  "private",
  "public",
  "static",
  "null",
  "true",
  "false"
]);
let Jl = /^[a-z_$][\w$]*$/i, Ja = (e) => {
  let t = /[a-z_$][\w$]*/gi, l = Qe(), i = [
    /\b(?:var|let|const)\s+([a-z_$][\w$]*)/gi,
    // variable declarations
    /\bfunction\s+([a-z_$][\w$]*)/gi,
    // function declarations
    /\bclass\s+([a-z_$][\w$]*)/gi,
    // class declarations
    /\bimport\s+([a-z_$][\w$]*)/gi,
    // import statements
    /\bfunction\s*[^(]*\(([^)]*)\)/g,
    // function parameters
    /\(([^)]*)\)\s*=>/g,
    // arrow function parameters (parentheses)
    /\b([a-z_$][\w$]*)\s*=>/gi
    // arrow function parameters (single param without parentheses)
  ];
  for (let o of i) {
    let u;
    for (; (u = o.exec(e)) !== null; ) {
      let y = u[1];
      if (y) {
        let p = q(K(y, ","), (h) => ee(k(h), /=.*$/, ""));
        for (let h of p)
          dl(h, Jl) && l.add(h);
      }
    }
  }
  let f = [], n = /(['"`])(?:\\[\s\S]|(?!\1)[^\\])*\1/g, s = /\$\{([\s\S]*?)\}/g, a;
  for (; (a = n.exec(e)) !== null; ) {
    let o = a[1], u = a[je], y = u + C(a[0]);
    if (o === "`") {
      let p = a[0], h = a[je], S = 0, I;
      for (; (I = s.exec(p)) !== null; ) {
        let P = I[je] + 2, F = P + C(I[0]) - 3;
        P > S && L(f, [
          h + S,
          h + P
        ]), S = F;
      }
      S < C(p) && L(f, [
        h + S,
        h + C(p)
      ]);
    } else
      L(f, [u, y]);
  }
  let c = Qe(), r = /\b([a-z_$][\w$]*)\s*:/gi;
  for (; (a = r.exec(e)) !== null; )
    sr(f, a[je]) || c.add(a[1]);
  let E = [];
  for (; (a = t.exec(e)) !== null; ) {
    let o = a[0], u = a[je], y = e[u - 1];
    Qa.has(o) || l.has(o) || y === "." || c.has(o) || sr(f, u) || L(E, [
      o,
      u,
      // start index of the variable
      u + C(o)
      // end index of the variable
    ]);
  }
  return E;
}, sr = (e, t) => di(e, ([l, i]) => t >= l && t < i), ms = (e, t) => {
  let l = Ja(t), i = "", f = 0, n = e[M];
  for (let [s, a, c] of l)
    if (s in n)
      i += Q(t, f, a) + `${M}.${s}`, f = c;
    else
      for (let r of [Ft, Kl, Gl, Nr, Fs])
        if (n[r] && s in n[r]) {
          i += Q(t, f, a) + `${M}.${r}.${s}`, f = c;
          break;
        }
  return i + Q(t, f);
}, Za = (e) => vi(({ [Ee]: t, prop: l }) => (Kt(t)[le].add(l), e)), Zl = !1, bl = [], ws = (e) => (bl = [], Zl = !0, e({}), Zl = !1, [...bl]), Is = (e) => {
  let t = ws(e), l = C(t);
  if (l) {
    let [i, f] = t[l - 1];
    return (n) => Bt(n) ? i[f] : i[f] = n;
  }
}, he = (e, t) => {
  if (!ar(e) || zt(e)) return e;
  let l = {
    get(s, a) {
      return Zl && (G(s, a) || !(a in s)) && L(bl, [i, a]), mt.get(s, a, i);
    },
    set(s, a, c) {
      a in s || X(s, a);
      let r = i[a];
      if (r === c) return !0;
      let E = Kt(i), o = {
        [we]: s,
        [Ee]: i,
        prop: a,
        [It]: r
        // [NEW_VALUE]: newValue,
        // [OPERATION]: UNDEFINED,
      };
      gi(o, "wc"), dt.has(c) && (dt[Y](c), c = c(o)), f.has(a) || (c = he(c)), o[ot] = c, ba(o);
      let u = mt.set(s, a, c, i);
      return fr(E, o), u;
    },
    [Vi](s, a) {
      let c = s[a], r = mt[Vi](s, a);
      return fr(Kt(i), {
        [we]: s,
        [Ee]: i,
        prop: a,
        [It]: c,
        [ot]: Te,
        [yi]: Y
      }), r;
    },
    [Wl](s, a, c) {
      let r = c[d], E = i[a];
      return dt.has(r) && (c[d] = r({ [Ee]: i, prop: a, [ot]: r, [It]: E })), !f.has(a) && d in c && (c[d] = he(c[d])), mt[Wl](s, a, c);
    }
  };
  const i = new Proxy(zt(t) && Re(t) ? Ua(t, e) : e, l), f = Qe();
  let n = {
    // [PARENT]: parent,
    // [TARGET]: target,
    // proxied,
    [Ee]: Me(),
    [Ae]: {},
    skip: f
    // refs: [],
    // [ON_SET]: {},
  };
  gl.set(i, n);
  for (let s in e) {
    let a = e[s];
    dt.has(a) && (a = a({
      [we]: e,
      [Ee]: i,
      prop: s,
      [It]: Te
    })), !f.has(s) && ar(a) && mt.set(e, s, a, i);
  }
  return i;
}, ar = (e) => U(e) || Re(e), fr = (e, t) => {
  let l = Me(), i = e[Ae][t.prop];
  i && D(i, (n, s) => l.set(s, n)), D(e[Ee], (n, s) => l.set(s, n));
  let f = Xe(l);
  _a(f, Aa);
  for (let [n] of f) n(t);
}, ba = (e) => {
  e[yi] = Bt(e[It]) ? Tt : Bt(e[ot]) ? Y : Xr;
}, Ps = "getItem", ds = "setItem", ei = Me(), ef = (e) => {
  let t = Ba(e);
  return t && G(t, Ps) && G(t, ds);
}, ti = (e, t) => Ci(e[Ps](t) || ""), nr = (e, t, l) => e[ds](t, cs(l)), cr = (e) => "_b_" + e, Cs = (e, t, l) => ef(e) ? (l && (l = cr(l), G(e, l) && (t = ti(e, l))), vi(({ [Ee]: f, prop: n }) => (ei.set(l, [f, n, e]), l = l || cr(n), G(e, l) ? t = ti(e, l) : nr(e, l, t), Cl(() => vt(f, n, () => {
  nr(e, l, f[n]);
})), t))) : x(nl, _i, Wt), tf = (e) => {
  if (ei.has(e.key)) {
    let [t, l, i] = ei.get(e.key);
    i === e[pa] && (t[l] = ti(i, e.key));
  }
}, Mt = (e, t, l = 0) => {
  let i = [], f = ws(t || e);
  return D(f, ([n, s]) => {
    L(i, Ds(n, s, e, l));
  }), t && e({}), () => D(i, (n) => n());
}, vt = (e, t, l, i = 0) => {
  let f;
  return zt(e) ? V(t) || kt(t) ? f = Ds(e, t, l, i) : f = lf(e, l, i) : (x(dr + `watch non-${Ee} ${Wt}/${ut}.`), f = () => {
  }), f;
}, gl = Me(), dt = Qe(), vi = (e) => dt.add(e) && e, zt = (e) => gl.has(e), Kt = (e) => gl.get(e), li = (e) => gl[Y](e), lf = (e, t, l = 0) => {
  if (zt(e)) {
    let i = Kt(e)[Ee];
    return i.set(t, l), () => i[Y](t);
  }
}, Ds = (e, t, l, i = 0) => {
  let f = Kt(e)[Ae];
  return f[t] || (f[t] = Me()), f[t].set(l, i), () => f[t][Y](l);
};
X(he, "persist", (e, t) => Cs(localStorage, e, t), "wc");
X(he, "session", (e, t) => Cs(sessionStorage, e, t), "wc");
X(he, "init", vi, "wc");
X(he, le, Za, "wc");
let gs = (e, t, l = !0) => new Function(e, l ? `return(${t})` : t), rf = (e, t) => t ? Es(e) : Gt(e), $l = (e, t = "", l = !0) => (Pa(e) && !l && (e += `(${t})`), ns(e) || (e = rf(e, l == ie), e = `(${t})=>` + (l ? `(${e})` : `{${e}}`)), e), Ul = "required", Er = "matches", or = "\\p{L}", sf = "\\p{Nd}", af = us(jl(jl("^(?!.*\\.{2})[w._%+-]+@(?:[w](?:[w-]*[w])?\\.)+[l]{2,}$", /w/, or + sf), /l/, or), "u"), ff = (e) => {
  let t = {}, l = {};
  e || (e = {});
  let i = (r, E, o) => {
    let u = !1;
    return (V(r) || U(r)) && (u = o ? C(r) >= E : C(r) <= E), kt(r) && (u = o ? r >= E : r <= E), u;
  }, f = {
    [Ul]: (r) => !!r || r === 0,
    min: (r, E) => i(r, E, !0),
    max: (r, E) => i(r, E, !1),
    [tl]: (r) => V(r) && pe(r, af),
    same: (r, E, o) => r === o[E],
    in: (r, E) => U(E) && v(E, r),
    [Er]: (r, E) => V(r) && pe(r, E),
    type: (r, E) => f.in(Rt(r), U(E) ? E : [E])
  }, n = {
    [Ul]: (r) => Oe(r, "is", Ul + "."),
    min: (r, E) => Oe(r, _e, "at least", E + "."),
    max: (r, E) => Oe(r, _e, "at most", E + "."),
    [tl]: (r) => Oe(r, _e, Ar, tl + "."),
    same: (r, E) => Oe(r, "must match", E + "."),
    in: (r, E) => Oe(r, _e, "equal to", re(E, " or ") + "."),
    [Er]: (r) => r + " has an invalid format.",
    type: (r, E) => Oe(r, _e, Rl, (U(E) ? re(E, " or ") : E) + ".")
  }, s = (r, E) => {
    t[r] = E;
  }, a = (r, E, o) => {
    f[r] = E, o && (n[r] = o);
  }, c = () => {
    $i(l);
    for (let [r, E] of rt(t)) {
      let o = e[r];
      for (let u of E) {
        let y = "", p = "", h = "";
        V(u) ? y = u : Re(u) && (y = u[kr], p = u[d], h = u[Br]);
        let S = f[y];
        if (!S) {
          Dl("Unknown rule: " + y);
          continue;
        }
        S(o, p, e) || (l[r] || (l[r] = []), h ? L(l[r], h) : L(l[r], n[y](r, p, e) || r + " is invalid."));
      }
    }
    return !Lt(l);
  };
  return {
    prop: s,
    rule: a,
    [Ra]: c,
    errors: l
  };
}, M = At(), Ct = xa(Zt), $s = [];
Qe();
let rn = () => {
  let e = (T) => u.get(T), t = (T, O = () => !0) => {
    let R = T ? Ol(T) : Ot;
    for (; R; ) {
      let N = e(R);
      if (N && O(N)) return N;
      R = Ol(R);
    }
  }, l = (T, O) => {
    let R = e(T);
    if (!R) {
      let N = O && e(O) || t(O || T);
      R = {
        // Local context
        [M]: { ...m },
        // A reference to the element. Convenience for internal use.
        el: T,
        [wl]: N,
        // UID context
        uid: $e(N, "uid", {}),
        /** Attributes or directives */
        attr: {},
        /** Cleanup functions */
        cFns: [],
        /**
         * Skip the hydration process
         * - 0: not hydrated (default)
         * - 1: skip self
         * - 2: skip children
         * - 3: skip self and children
         */
        [le]: 0,
        ...Z
      };
      for (let A in F) {
        let g = F[A](R, N);
        g && X(R[M], A, g, "c");
      }
      u.set(T, R), R[se] = nf(R, H + se)();
    }
    return R;
  }, i = (T, O, R, N) => {
    let A = N(T.el), g = o(T, R);
    $(T, Mt(() => A(g)));
  }, f = async (T, O) => {
    V(T) && (T = te(T)), V(O) && (O = te(O)), qe(O) || (O = Te), qe(T) && (await c(T), await _l(T, async (R) => {
      let N = !1, A = T == R ? O : Te;
      return La(R) && hs(R) ? N = s(R, A) : xe(R) && (We(R) == ce && ue(ae(R, mi)) ? N = !1 : N = await a(R, A)), N;
    }));
  }, n = async (T, O = !0, R = !0) => {
    await _l(T, async (N) => {
      let A = e(N);
      if (A) {
        if (A[Ce])
          for (let g of A[Ce])
            await n(g, O, R);
        A.ph && Ht(A.ph), D(A.cFns, (g) => g()), R && u[Y](N), O && Ht(N);
      }
      return !0;
    });
  }, s = (T, O) => {
    let R = T[pt], N = Ls(Gt(R || ""));
    if (N && pe(N, il)) {
      let A = l(T, O), g = o(A, N, "", ie);
      $(A, Mt(() => T[pt] = g())), ii(A, ie, R);
    }
    return !1;
  }, a = async (T, O) => {
    let R = l(T, O);
    if (ve(R, 3)) return !0;
    for (let [N, A] of y) {
      let g = [];
      if ($a(N))
        Rs(T, (ye, Vt) => {
          pe(ye, N) && L(g, [ye, Vt]);
        });
      else {
        let ye = ae(T, N);
        ue(ye) || L(g, [N, ye]);
      }
      for (let [ye, Vt] of g) {
        if (ve(R, 1) || ve(R, 3)) break;
        ii(R, ye, Vt), await A(R, ye, Gt(Vt));
      }
      if (ve(R, 1) || ve(R, 3)) break;
    }
    return ve(R, 0) && (R[le] = 1), Lt(R[Pe]) || u[Y](T), !ve(R, 2) && !ve(R, 3);
  }, c = async (T) => {
    let O = await xs(T, wr, []);
    D(O, ([R, N]) => {
      let A = We(N), g = A != ce && A != b ? Ne : A, ye = N[g == Ne ? ts : Dt];
      Z[g][R] = k(ye);
    });
  }, r = (T) => (O, R) => {
    Z[T][O] = R;
  }, E = (T, O, R = "", N = !0) => {
    let A;
    return O = ms(T, $l(O, R, N)), O in P ? A = P[O] : (A = At(), I[A] = gs(M, O), P[O] = A), A;
  }, o = (T, O, R = "", N = !0) => {
    let A;
    try {
      let g = O in I ? O : E(T, O, R, N);
      A = I[g](T[M]);
    } catch (g) {
      x(g[Br]), A = () => Ct;
    }
    return A;
  }, u = Me(), y = [], p = {}, h = {}, S = { [ne]: Ia }, I = {}, P = {}, F = {
    // The element itself
    $el: (T) => T.el,
    // Unique identifier for the element
    $uid: (T) => T.uid,
    // Reactive properties defined in the element or inherited from the parent context
    [Gl]: ur(Gl, H + Ae, !0),
    // The $data context
    [Kl]: ur(Kl, ze),
    // Data Level Context:
    // Referenced under the same $data context, not including nested $data contexts
    [Bl]: Tr(Bl),
    [kl]: Tr(kl),
    // The $each context
    [Ft]: (T, O) => O == null ? void 0 : O[M][Ft],
    $cleanup: (T) => (O) => $(T, O)
  }, [z, _] = Xa(h, S), J = (T) => As(T, _(T)), B = {
    [El]: z,
    [Qi]: r(Qi + "s"),
    [Ne]: r(Ne),
    [b]: r(b),
    [ce]: r(ce),
    [Ae]: r(Ae),
    data: r(yt),
    mask: r(Tl),
    [es]: r(pl)
  }, m = {
    [jt]: n,
    [qt]: f,
    $set: B,
    [Nr]: he({})
  }, w = {
    [El]: J,
    emit: Ve,
    listen: me,
    /** Get the local context of an element */
    context: (T) => {
      var O;
      return (O = e(te(T))) == null ? void 0 : O[M];
    },
    http: Ql,
    state: he,
    watch: vt,
    effect: Mt,
    // Tools
    hasProp: G,
    getProp: $e,
    setProp: X,
    sync: xt,
    [Dr]: Be,
    [ha]: ff
  };
  D(Ie(w), (T) => m[Le + T] = w[T]);
  let Z = {
    [Ne]: p,
    [b]: {},
    [ce]: {},
    [Ae]: {},
    data: {},
    // ! HYDRATION
    [br]: y,
    bnodes: u,
    [Tl]: {},
    [pl]: {},
    routes: h,
    routeRules: S,
    // ! PUBLIC CONTEXT
    gc: m,
    // ! TOOLS
    exec: o,
    [Ze]: i,
    bnode: [l, e]
  };
  return m[Il] = Va(Z), L($s, _), D([B, Ql, m, Z], (T) => gi(T, "wc")), Z;
}, ve = (e, t) => e[le] == t, $ = (e, t) => {
  L(e.cFns, t);
}, ht = (e, t) => {
  let l = e[wl];
  l && (l[Ce] || (l[Ce] = []), v(l[Ce], t) || L(l[Ce], t));
}, nf = (e, t, l = "{}") => {
  let i = xe(e.el) ? ae(e.el, t) : null;
  return ue(i) || ii(e, t, i), i = Gt(i || l), e.exec(e, i);
}, ii = (e, t, l) => {
  e[Pe][t] = l, xe(e.el) && Mi(e.el, t);
}, Gt = (e) => ee(k(re(q(K(e, oe), (t) => Ke(k(t), "//") ? "" : t), oe)), /;$/, ""), il = /\${((?!.*\${).*?)}/, cf = /{{((?!.*{{).*?)}}/, Ls = (e, t = "${$1}") => jl(e, cf, t), ur = (e, t, l) => (i, f) => {
  let n = i.el, s = f ? f[M][e] : Ot, a = xe(n), c = a && !ue(ae(n, t)), r = a && (i[Pe][De] || !ue(ae(n, De))), E = a && (!s || c);
  return E && !c && t == ze && xi(n, ze, ""), E && !r ? he({}, l && s) : s || {};
}, Tr = (e) => (t, l) => !l || xe(t.el) && !ue(ae(t.el, ze)) ? {} : l[M][e], Ef = () => {
  let e = Yt();
  As(e, Ii($s, (t) => t(e)));
}, sn = (e = {}) => {
  Zt in Fe || (gi(e, "wc"), X(Fe, Zt, e, "wc"), me(Fe, _i, tf), me(Fe, "pop" + Ee, Ef)), Ve(Fe, Zt);
}, Ll = (e, t) => Q(e, Ke(e, H) ? t : t - 2), xl = async (e) => {
  await pr(e, Ir), await pr(e, ci);
}, pr = async (e, t) => {
  let l = t == ci, i = e[M][l ? Bl : kl], f = l ? [
    /*B_IF, */
    Jr,
    wi,
    ze
  ] : [ze];
  for (let n of e[Ce] || [e.el]) {
    let s = await xs(n, t, f);
    D(s, ([a, c]) => {
      i[a] = l ? c : c[ts], $(e, () => it(i, a));
    });
  }
}, xs = async (e, t, l) => {
  let i = [], f = t != ci;
  return await _l(e, (n) => {
    if (xe(n)) {
      if (di(l, (a) => !ue(ae(n, a)))) return !1;
      let s = ae(n, t);
      s && (Mi(n, t), L(i, [s, n]), f && Ht(n));
    }
    return !0;
  }, f), i;
}, of = async (e, t) => {
  e[le] = 3;
}, uf = [mr, of], Tf = (e, t, l) => {
  let i = e.el, [f, n] = e.bnode;
  e[le] = 3;
  let [s, a] = q(K(l, " in "), k), [c, r] = q(K(s, ","), k);
  r || (r = je);
  let E = Oe("the", t, Je, Oi);
  if (!pe(c, Jl) || !pe(r, Jl))
    return x(E, Ar, "alias.");
  let o = e.exec(e, a), u = Is(o), y = u ? u() : o(), p = u && zt(y), h = !1;
  if (kt(y) && (y = he(Ji(y, 1)), h = !0, u && Mt(() => {
    let _ = u();
    kt(_) && xt(y, Ji(_, 1));
  }, () => u())), !(U(y) || Re(y)))
    return x(E, `an ${ut}, ${Wt}, or ${ne}.`);
  e.ph = ys(t), Ge(i, gt, e.ph), ht(e, i);
  let S = {}, I = ([_, J]) => {
    let B = ps(i);
    Ge(e.ph, ml, B);
    let m = f(B, i);
    G(e[Pe], De) && (m[Pe][De] = "");
    let w = he({});
    X(w, c, J, "c"), X(w, r, _, "c"), X(m[M], Ft, w, "c"), $(m, () => {
      li(w);
    }), $(m, vt(w, r, ({ [ot]: Z }) => {
      let T = S[_][1];
      Z !== T && (w[r] = T);
    })), p && $(m, vt(w, c, () => {
      y[w[r]] = w[c];
    })), S[_] = [B, _], xl(m).then(() => {
      e.gc[qt](B, i);
    });
  }, P = ([_, J]) => {
    let B = S[_], m = n(B && B[0]);
    if (m) {
      let w = m[M][Ft];
      w[c] = J, w[r] = _, B[1] = _;
    }
  }, F = ([_, J]) => {
    let [B] = S[_];
    e.gc[jt](B), it(S, _);
  }, z = {
    [Tt]: I,
    [Xr]: P,
    [Y]: F
  };
  for (let _ of rt(y))
    z[Tt](_);
  u && $(e, vt(y, Te, ({ [yi]: _, prop: J, [ot]: B }) => {
    z[_]([J, B]);
  })), $(e, () => {
    for (let _ in S)
      z[Y]([Number(_), null]);
    h && li(y);
  });
}, pf = [Jr, Tf], Ms = async (e, t, l) => {
  let i = t == ze, f = i ? yt : Ae, n = e[f], s = e[wl], a = l ? n[l] || e.exec(s || e, l) : () => ({}), c = e[M][Le + f], r = await a((s == null ? void 0 : s[M]) || e[M]);
  if (!Re(r))
    return e[le] = 3, x(ss(Je, t, "an " + Wt, Rt(r)));
  for (let E in r) X(c, E, r[E], Fa(r, E));
  i && await xl(e), $(e, () => {
    Cl(() => {
      li(e[M][Le + f]);
    });
  });
}, Rf = [H + Ae, Ms], hf = [ze, Ms], Rr = {}, yf = async (e, t, l) => {
  if (l) {
    let i = e.exec(e, l)();
    if (!U(i) || !Pi(i, V))
      return x("the", t, Je, _e, `an ${ut} of ${Ue}(s).`);
    e.uid = i.reduce((f, n) => {
      let s = At(5);
      return Rr[s] = !0, X(f, n, s, "wc"), f;
    }, {}), $(e, () => {
      for (let f in e.uid) it(Rr, e.uid[f]);
    });
  }
}, Sf = ["b-uid", yf], vs = (e) => (t, l, i) => {
  if (!(G(t[Pe], wi) || G(t[Pe], Zr) && e == ie)) {
    t[le] = 2;
    let f = t[Ne];
    i in f && (i = Es(f[i] || i)), i && t[Ze](t, l, i, (n) => async (s) => {
      await t.gc[Il](n, e, s()), t[le] = 3;
    });
  }
}, Of = [Zr, vs(Pt)], _f = [qs, vs(ie)], Nf = async (e, t, l) => {
  let i = e.el, f = l ? e[Ne][l] || e.exec(e, l)() : i[Dt];
  e[le] = 2, V(f) ? (e[Ce] = await e.gc[Il](i, ml, k(f)), ht(e, i), Ht(i)) : Dl(t + ":", nl, d, oe, f);
}, Af = [wi, Nf], mf = async (e, t, l) => {
  let i = e.el, f = e[ce], n = We(i) == ce;
  e[le] = 2;
  let s = l ? f[l] || e.exec(e, l)() : [];
  if (s = q(
    U(s) ? s : [s],
    (a) => f[a] || a
  ), ht(e, i), n) {
    let a = ae(i, "src"), c = a ? await Ql.get(a) : hs(i);
    c && L(s, Gt(c)), Ht(i);
  }
  for (let a of s) {
    let c = a;
    if (V(c)) {
      let r = ns(c);
      c = gs(M, ms(e, c), r), r && (c = c(e[M]));
    }
    Di(c) && await c(e[M]);
  }
}, wf = [mi, mf], If = (e, t, l) => {
  let i = e.el;
  if (l && We(i) != b) {
    let f = e[b], n = f[l] || e.exec(e, l)();
    n = q(
      U(n) ? n : [n],
      (c) => f[c] || c
    );
    let s = At();
    Ya(i, s);
    let a = Xl(b);
    a[pt] = Pf(re(n, oe), "." + s), e.gc[qt](a, i), Ge(i, Ut, a), $(e, () => {
      e.gc[jt](a);
    });
  }
}, Pf = (e, t) => {
  e = ee(e, /\/\*[\s\S]*?\*\//g, ""), e = Ls(e);
  let l = [], i = At();
  for (; pe(e, il); ) {
    let c = dl(e, il);
    c && (L(l, c[0]), e = ee(e, il, i));
  }
  let f = $t(K(e, "}"), k), n = oe + "    ", a = re(q(f, (c) => {
    let [r, E] = K(c, "{"), o = q(
      q(K(r, ","), k),
      (u) => v(u, "&") ? ee(u, /&/g, t) : t + " " + u
    );
    return E = re(q($t(K(E || "", oe), k), k), n), re(o, ",") + ` {${n + E + oe}}`;
  }), oe);
  return D(l, (c) => {
    a = ee(a, i, c);
  }), a;
}, df = [H + b, If], Cf = (e, t, l) => {
  let i, f;
  try {
    i = te(l), qe(i) && (l = $l(l, "", ie));
  } catch {
  }
  e[Ze](e, t, l, (n) => (s) => {
    try {
      let a = s();
      U(a) ? [i, f] = a : i = te(a);
    } catch {
    }
    v([ml, Ut, zl, sl], f) || (f = Ut), qe(i) ? (Ge(i, f, ...e[Ce] || [n]), ht(e, n)) : Dl(qr, He, Hr, t + `="${l}"`);
  });
}, Df = [H + qr, Cf], Ui = At(), gf = (e, t, l) => {
  if (!(G(e[Pe], De) ? De : G(e[Pe], bt) ? bt : ""))
    return x("the", t, Je, _e, "used with", De, "or", bt + ".");
  let f = e.exec(e, l)();
  if (U(f) || C(f) == 2) {
    let n = Lf(e.el, ...f);
    e[se][Ui] = n, $(e, n[tt]);
  }
}, $f = [H + Et, gf], Lf = (e, t, l) => {
  if (!xe(e))
    return x(nl, Et, He, e);
  let i = null, f = 1, n = 2, s = 3, a = 4, c = f, r = {
    [Et]: ["none", "important"]
  }, E = Ns(e[b]), o, u, y, p, h, S, I = () => {
    if (o = ir(t), p = ir(l), !o || !p)
      return x(nl, Et, j + "ors:", `'${t}' and '${l}'`, _e, "valid CSS", j + "ors.");
    [u, y] = lr(o), [h, S] = lr(p);
  }, P, F = me(e, Et + Mr, (_) => {
    _[we] === e && (c == n ? (c = a, i && (Se(e, o), fe(e, E))) : c == s && (c = f, i || (Se(e, p), fe(e, E))), P && P());
  }), z = (_, J) => {
    P = J, !(_ && i && c == a || !_ && i === !1 && c == a) && (I(), _ ? i === null || i && c == f || i === !1 && c == a ? (i = !0, c = n, Se(e, p, u), fe(e, y, r), Ye(() => {
      Se(e, y, r), fe(e, u);
    })) : !i && c == n ? (c = s, Se(e, S), fe(e, h)) : i && c == s && (c = n, Se(e, y), fe(e, u)) : (i === null && (i = !1, c = a, Se(e, o, h), fe(e, S, r), Ye(() => {
      Se(e, r), P && P();
    })), !i && c == f || i && c == a ? (i = !1, c = n, Se(e, o), fe(e, r), Ye(() => {
      Se(e, r), fe(e, p);
    })) : i && c == n ? (c = s, fe(e, o)) : !i && c == s && (c = n, fe(e, p))));
  };
  return X(z, tt, F), z;
}, xf = (e, t, l) => {
  let i = e.el;
  e.ph = ys(t), Ge(i, gt, e.ph), e[le] = 3, ht(e, i);
  let [f] = e.bnode, n, s, a = () => {
    e.gc[jt](n.el), n = Te;
  };
  e[Ze](e, t, l, () => (c) => {
    let r = c();
    Ye(async () => {
      if (r) {
        if (!n) {
          let E = ps(i);
          Ge(e.ph, Ut, E), n = f(E, i), n[Pe][De] = "", await xl(n), await e.gc[qt](E, i), ht(e, E);
        }
        s = n[se][Ui], s && s(!0);
      } else !r && n && (s ? s(!1, a) : a());
    });
  });
}, Mf = [De, xf], vf = (e, t, l) => {
  let i = Ss(e.el)[fl];
  i == "none" && (i = "block"), e[Ze](e, t, l, (f) => (n) => {
    let s = n();
    Ol(f) && Ye(() => {
      let a = e[se][Ui];
      s ? (f[b][fl] = i, a && a(!0)) : a ? a(!1, () => hr(f)) : hr(f);
    });
  });
}, Uf = [bt, vf], hr = (e) => {
  e[b][fl] = "none";
}, Xt = (e, t, l) => {
  let i = Ll(t, 5), [f] = K(i, "-"), n = e[se][t] || {}, s = e.el, a = e.exec(e, l, "$entry", !1), c = Sl(a, n[al] || 100), r = new IntersectionObserver((E) => {
    D(E, (o) => {
      o.isIntersecting != (f == Ur) && (c(o), n[zs] && r[Hl]());
    });
  }, n);
  r[Yr](s), $(e, () => r[Hl]());
}, Ff = [
  [zi, Xt],
  [H + zi, Xt],
  [Ki, Xt],
  [H + Ki, Xt]
], yr = (e, t, l) => {
  let i = Ll(t, 5);
  K(i, "-");
  let f = e.el, n = e[se][t] || {}, s = n[ui] ? te(Ti) : f, a = e.exec(e, l, "$size", !1), c = Sl(a, n[al] || 100), r = new ResizeObserver((E) => {
    let o = E[0].borderBoxSize[0];
    c([o.inlineSize, o.blockSize]);
  });
  r[Yr](s, n), $(e, () => r[Hl]());
}, Bf = [
  [Gi, yr],
  [H + Gi, yr]
], at = "keyup", ft = "keydown", Sr = "outside", kf = "window", Us = "control", ri = "meta", Qt = "arrow", Or = [
  ri,
  Us,
  "shift",
  "alt",
  "fn"
], Hf = {
  ctrl: Us,
  cmd: ri,
  [jr]: ri,
  esc: "escape",
  del: Y,
  up: Qt + "up",
  down: Qt + "down",
  left: Qt + "left",
  right: Qt + "right"
}, Yf = (e, t, l) => {
  let i = Ll(t, 5), [f, ...n] = K(i, "-"), s = e.el, a = s, c = (p) => {
    let h = e.exec(e, l, Le + Hi, !1);
    Di(h) ? h(p) : x(ss(Hi, t, "a " + Pl, Rt(h())));
  }, r = e[se][t] || {};
  D(n, (p) => {
    r[p] = !0;
  }), al in r && (c = Sl(c, r[al])), qi in r && (c = Ha(c, r[qi])), r[Sr] || r[ui] ? a = Nt : r[kf] && (a = Fe);
  let E = {};
  v([ft, at], f) && D($e(r, "keys", []), (p) => {
    E[Hf[p] || p] = !0;
  });
  let o = Lt(E), u = f;
  if (v([ft, at], f) && o) {
    let p = {};
    f = t;
    let h = Sl((S) => {
      Ve(a, f, S);
    }, 600);
    $(e, me(a, ft, (S) => {
      let I = ge(S.key);
      p[I] || (p[I] = !0), Cl(() => {
        p.meta && !v(Or, I) && Fl(S, p);
      });
      let P = Ie(p);
      o > 1 && at == u && p.meta && !v(Or, I) ? h(P) : ft == u && Ve(a, f, P);
    })), $(e, me(a, at, (S) => {
      ft == u && Fl(S, p), Ve(a, f, Ie(p)), at == u && Fl(S, p);
    })), $(e, me(a, "focus", () => {
      $i(p);
    }));
  }
  $(e, me(a, f, (p) => {
    if (r[zr] && p[aa](), r.stop && p.stopPropagation(), !(r.self && p[we] !== p.currentTarget) && !(r[Sr] && (s.contains(p[we]) || !Ga(s)))) {
      if (v([ft, at], u)) {
        let h = p[$r];
        if (!(Lt(E) == Lt(h) && Pi(Ie(E), (S) => v(h, S))))
          return;
      }
      c(p);
    }
  }, r));
}, Fl = (e, t) => it(t, ge(e.key)), zf = [/^(b-on-|on-)[\w-]+$/, Yf], Kf = (e, t, l) => {
  let i = Ll(t, 7);
  l = $l(l || da(i), "$initial"), i = Wa(i);
  let f = ae(e.el, i), n = e[se][t] || {};
  e[Ze](e, t, l, (s) => (a) => {
    let c = a(f || ""), r = n.prop || _s(i) && i;
    c || r ? xi(s, i, !r && c === !0 ? "" : c, r) : Mi(s, i);
  });
}, Gf = [/^(b-bind-|bind-)[\w-$]+$/, Kf], Jt = Me(), Wf = (e, t, l) => {
  let i = Oe("the", t, Je), f = Oe(Oi, "a reactive", d), n = j + "ed", s = e.el, a = We(s), c = s.type;
  if (!v([W, ct, j], a))
    return x(i, Pr, W, `, ${ct}, and ${j} ${He}s.`, s);
  let r = Is(e.exec(e, l));
  if (!r)
    return x(i, f, s);
  let E = r(), o, u = () => Xe(a == j ? s[se] : I()), y = e[se][t] || {}, p = (m) => {
    let w = m[ue(ae(m, d)) && S ? nt : d], Z = Jt.get(m) || y;
    if (V(w) && (Z.trim && (w = k(w)), !Z.raw)) {
      let T = Ci(w);
      (kt(T) || ue(T) || ga(T)) && (w = T);
    }
    return w;
  }, h = (m) => a == W && v(m, c), S = h([st, ji]), I = () => Li(W + `[type="${st}"][name="${s.name}"]`), P = () => h(st) && C(I()) > 1, F = () => {
    let m = [
      [W, st, [ne, Ue, el, ut]],
      [W, ji, [ne, Ue, el]],
      [W, ne, [ne]],
      [W, "range", [ne]],
      [W, "", [ne, Ue]],
      [ct, "", [ne, Ue]],
      [j, "", [ne, Ue, el, ut]]
    ];
    for (let [w, Z, T] of m)
      if (a == w && (!Z || c == Z)) {
        ue(E) || Bt(E) || v(T, Rt(E)) || Dl(i, f, Rl, re(T, " or "), `for ${a == W ? c + " " : ""}${w} ${He}s,`, as(Rt(E)), s);
        break;
      }
  };
  Ye(() => {
    F(), j == a ? D(u(), (m) => Jt.set(m, y)) : h(st) && Jt.set(s, y);
  });
  let z = () => {
    if (E = r(), o = p(s), v([W, ct], a))
      if (c == st && U(E))
        s[nt] = v(E, o);
      else if (S)
        s[nt] = E === o;
      else {
        if (s[ul] || Nt.activeElement === s && E === o) return;
        E !== o && (s[d] = E);
      }
    else a == j && (U(E) ? D(u(), (m) => {
      m[n] = v(E, p(m));
    }) : s[d] = E);
  };
  Ye(() => $(e, Mt(z)));
  let _ = {}, J = () => {
    if (E = r(), a == j && s.multiple || P()) {
      let m = [];
      D(u(), (w) => {
        a == j && Jt.set(w, y), (w[n] || w[nt]) && L(m, p(w));
      }), r(m);
    } else r(S && !s[nt] ? !1 : p(s));
  };
  (h([ie, "search", "url", "tel", tl, "password"]) || a == ct) && (_[Qs] = za, _[Js] = Ka);
  let B = y.lazy || S || a == j ? "change" : W;
  _[B] = J;
  for (let [m, w] of rt(_))
    $(e, me(s, m, w));
}, jf = ["b-model", Wf], qf = (e) => {
  e["#"] = new RegExp("\\p{Nd}", "u"), e["&"] = /[\p{L}]/u, e["*"] = /[\p{L}\p{Nd}]/u;
}, rl = "output", ke = "cursor", Fi = "character", si = "quantifier", Nl = "isToken", Al = "isOptional", ai = "isMultiple", fi = "parts", Vf = (e, t, l) => {
  let i = e.el, f = e[Tl];
  if (!(d in i && Ml in i))
    return x("the", t, Je, Pr, ct, He + "s and textual", W, "types (text, email, etc.).");
  let n = f[l], s = e[se][t] || {}, a = {
    ...s,
    [ol]: { ...e[pl], ...s[ol] },
    mask: l,
    [d]: "",
    [ke]: i[Ml],
    [fi]: [],
    [rl]: ""
  }, c = () => {
    a[d] = i[d], a[d] != a[rl] && (a[fi] = [], a[ke] = i[Ml], n && n(a), Jf(a), i[d] = a[rl], i.setSelectionRange(a[ke], a[ke]), Ve(i, St, a));
  };
  Ye(c), $(e, me(i, W, c, !0));
}, Xf = (e, t) => {
  let l = [], i = "\\";
  for (let f = 0; f < C(e); f++) {
    let n = e[f], s = {
      [Fi]: n,
      [si]: 1,
      [Nl]: !1,
      [Al]: !1,
      [ai]: !1
    };
    if (n != i || n == i && e[f + 1] == i) {
      if (v(Ie(t), n) && (e[f - 1] != i || e[f - 2] == i)) {
        let a = dl(Q(e, f + 1), /^\d+/);
        if (a) {
          let r = a[0];
          f += C(r), s[si] = +r;
        }
        s[Nl] = !0;
        let c = e[f + 1];
        (c == "?" || c == "+") && (s[Al] = c == "?", s[ai] = c == "+", f++);
      }
      L(l, s);
    }
  }
  return l;
}, Qf = (e, t) => Ii(Q(e, t + 1), (l) => !l[Al]), _r = (e, t, l) => {
  let i = -1;
  if (t) {
    let f = t[Fi];
    if (t[Nl]) {
      let n = dl(e, l[f]);
      n && (i = n[je]);
    } else i = Na(e, f);
  }
  return i;
}, Jf = (e) => {
  let t = e[ol], l = e[d], i = e[ke], f = Xf(e[St], t), n = "", s = l, a = Q(l, i);
  for (let [c, r] of rt(f)) {
    let E = r[Fi], o = r[si];
    if (r[Nl]) {
      if (o > 0) {
        if (!s) break;
        let u = "";
        for (; s && (o > 0 || r[ai]); ) {
          let y = r[Al] || o < 1, p = _r(s, r, t), h = y && p > 0 && Qf(f, +c), S = _r(s, h, t);
          if (p < 0 || S >= 0 && p > S) {
            y || (s = "");
            break;
          }
          p || (u += s[0], o--), s = Q(s, 1), a == s && (i = C(n + u));
        }
        n += u, r[d] = u;
      }
    } else s && (a == s && (i = C(n)), n += E, r[d] = E, s[0] == E && (s = Q(s, 1)));
  }
  e[ke] = e[ke] == 0 ? 0 : e[ke] == C(e[d]) ? C(n) : i, e[rl] = n, e[fi] = f;
}, Zf = (e) => {
  let t = e[d], l = $e(e, "decimal", "."), i = $e(e, "thousands", ","), f = $e(e, "precision", 2);
  l == "," && (i = "."), i == "." && (l = ",");
  let n = K(t, l), s = n[0], a = Ke(s, "-");
  s = ee(s, /\D/g, ""), s = s && (ee(s, /^0+/, "") || "0");
  let c = C(n) > 1, r = c ? re(Q(n, 1), l) : "", E = C(s), o = a ? "-" : "";
  for (let h = 0; h < E; h++)
    h > 0 && (E - h) % 3 == 0 && (o += i), o += "#";
  let u = e[ol];
  t = a ? "-" + s : s, f > 0 && (u[l] = us(`\\${l}`), c && (t += l + r), o += l + "#" + f), e[St] = o, a && (u["-"] = /-/), u["#"] = /\d/;
  let y = 0, p = "";
  for (let h of e[d])
    h == t[y] ? (p += h, y++) : p += "∅";
  e[d] = p;
}, bf = [H + St, Vf], en = (e, t, l) => {
  l = $l(l, "", !1), e[Ze](e, t, l, () => async (i) => {
    await i();
  });
}, tn = ["b-effect", en], ln = [
  /**
   * The b-ignore directive is used to stop the hydration of the element and its children.
   */
  uf,
  /**
   * Conditional hydration
   * Notes:
   * - b-if stops the hydration flow of the element and starts a new hydration flow with a copy of the element whenever the condition evaluates to true
   * - the original element is replaced with a placeholder comment node to hold its location in the DOM
   * - whenever the condition evaluates to false, the copy of the element is dehydrated and removed from the DOM
   */
  Mf,
  /**
   * Context directives
   * Notes:
   * - the order of inference is: $each, $data, $props, $store, $tools
   */
  Rf,
  hf,
  /** List rendering
   * Notes:
   * - b-each stops the hydration flow of the element and starts a new hydration flow for each item it creates
   */
  pf,
  /**
   * Unique ID generator
   */
  Sf,
  /**
   * Static template hydration
   * Notes:
   * - the inner HTML of the element is used as a template and it may include more than one root element
   * - the element that contains the b-template directive is removed from the DOM and its content is inserted in its place
   *   and because of that:
   *   - the b-template directive SHOULD NOT be used with elements that are self-closing (e.g. <img />, <input />, etc.)
   *   - the b-template directive CANNOT be used with: b-show, b-html, b-text, b-style, bind-*, b-model, b-mask, b-transition, on-*
   *     this is because these directives need to be hydrated on the element itself and not on its content
   *   - the b-template directive CAN be used with: b-ignore, b-props, b-data, b-ref, b-slot, b-if, b-each, b-uid, b-teleport, b-script, b-effect
   */
  Af,
  /**
   * Conditional display
   * Notes:
   * - the element is hydrated regardless of the condition
   * - the b-show directive toggles the `display` of the element based on the condition
   */
  Uf,
  /**
   * The b-teleport moves the element to a different location in the DOM.
   * Notes:
   * - b-teleport also works with the b-if and b-template directives
   */
  Df,
  /**
   * Run one or more scripts on the element
   * Notes:
   * - the b-script directive may hold one script or an array of scripts
   * - the script(s) are executed in order and awaited
   * - when b-script is in a script element the content of the src file or text content is added to the list of scripts to be executed
   */
  wf,
  /**
   * Dynamic hydration of HTML or text content and styles
   * Notes:
   * - if the element has a b-html and b-text directive, the b-html directive is hydrated and the b-text directive is ignored
   * - b-style always hydrates regardless of the b-html and b-text directives
   */
  Of,
  _f,
  /**
   * Dynamic insertion of styles
   * Notes:
   * - the style element is inserted after the element that contains the b-style directive
   */
  df,
  /**
   * Data binding directives
   * Used to bind data to an element's property or attribute
   * 
   * - The `b-bind-|bind-` directive is a general directive used to bind data to an element property or attribute
   * - The `b-model` directive is used to create a two-way data binding between an input value and a reactive property
   * - The `b-mask` directive is used to format an input value using a mask
   */
  Gf,
  // [b-bind|bind]-[attributeName]
  jf,
  bf,
  // ['b-boost', hydrateBoost],
  $f,
  // b-transition, b-transition-play, b-transition-reverse
  ...Ff,
  // [b-on|on]-enter, [b-on|on]-exit
  ...Bf,
  // [b-on|on]-resize
  zf,
  // [b-on|on]-[eventName]
  /**
   * b-effect: used to create an effect that run when its dependencies change.
   * It is perfect for small expressions, reactive or not.
   * Example: console.log(`Hello, ${$data.name}!`)
   */
  tn
], an = (e) => {
  D(ln, (t) => L(e[br], t)), e[Tl].money = Zf, qf(e[pl]);
};
export {
  Gf as bindDirective,
  hf as dataDirective,
  pf as eachDirective,
  Of as htmlDirective,
  Mf as ifDirective,
  uf as ignoreDirective,
  Ff as intersectionDirectives,
  bf as maskDirective,
  jf as modelDirective,
  Zf as moneyMask,
  rn as newApp,
  zf as onDirective,
  Rf as propsDirective,
  Bf as resizeDirectives,
  wf as scriptDirective,
  an as setAllDirectives,
  qf as setDefaultMaskTokens,
  sn as setup,
  Uf as showDirective,
  df as styleDirective,
  Df as teleportDirective,
  Af as templateDirective,
  $f as transitionDirective,
  Sf as uidDirective
};
//# sourceMappingURL=briojs.1.2.0.js.map
