let fl = "brio", qt = "$", Ss = "$store", Os = "$tools", We = "after", ui = "animation", yi = "append", At = "array", xe = "attr", pi = "Attribute", m = "b-", De = "before", Ml = "begin", dr = "body", nl = "boolean", Cr = "cache", _s = "can only be used on", Is = "Cannot ", at = "checkbox", ot = "checked", $r = "classList", Yi = "closest", Ai = "composi", Ns = "content", ws = "Content", Xe = "create", It = "data", Al = "debounce", ds = "detail", Cs = "define", z = "delete", me = "directive", Yl = "disconnect", Gl = "display", hi = "document", $s = "each", tt = "element", al = "end", Ri = "engine", Gi = "entries", jl = "error", rt = "evalEffect", Wl = "event", gs = "EventListener", Ps = "exit", Si = "ctxArgs", Xt = "get", Ds = "head", ji = "href", ht = "html", ks = "HTML", lt = "hydrate", Ye = "index", Pl = "inner", Qt = "insert", Oi = "Invalid", Vl = "length", Nt = "mask", gr = "method", xs = "must be", we = `
`, yt = "newValue", xt = "name", Ls = "Node", Kt = "not found.", it = null, ae = "number", Jt = "object", ms = "observe", Lt = "oldValue", _i = "on-", Wi = _i + "enter", Vi = _i + Ps, qi = _i + "resize", Ms = "once", hl = "onComplete", Ii = "operation", $e = "options", Ni = "outer", Yt = "parent", Xi = "patch", Me = "pause", Z = "play", Pr = "post", Dr = "prepend", vs = "prevent", Hs = "Propert", wi = Hs + "y", Ae = "props", Us = "put", Qi = "radio", Zt = "remove", Bs = "replace", di = "requires", b = "reverse", Qe = "route", Q = "script", kr = "Sibling", ft = "skip", ee = "select", Ne = "state", Fs = "start", Ci = "storage", Ge = "string", se = "style", zs = "teleport", te = "template", ye = "text", Ji = "throttle", $i = "tion", xr = "toString", Rl = "tokens", Ht = "transition", Ks = "type", Se, ql = "update", Ys = "validate", g = "value", gi = "With", Lr = "add" + gs, Sl = qt + It, Gt = qt + $s, Xl = qt + Ae, ve = m + It, mr = m + $s, Gs = m + ht, Ql = "b-if", js = "b-ignore", mt = "b-save", cl = "b-show", Ws = m + te, Mr = m + ye, vr = Cr + "Exp", Hr = "clone" + Ls, Ol = Ai + "ng", Ur = Ai + $i + Fs, Br = Ai + $i + al, Fr = Xe + "Comment", zr = Xe + "Element", Jl = Cs + wi, Kr = Cs + Hs + "ies", _l = "de" + lt, Zi = z + wi, Vs = me + "s", Yr = "ends" + gi, Dl = "func" + $i, Gr = Xt + pi, bi = Ds + "ers", ce = Pl + ks, W = "in" + Us, jr = Qt + "AdjacentHTML", Zl = Nt + "s", qs = Nt + "Token", bl = qs + "s", Wr = "next" + kr, Vr = "of " + Ks, Ve = Ni + ks, Xs = "Own" + wi, qr = Yt + Ls, vl = "path" + xt, Xr = vs + "Default", Qs = "proto" + Ks, Qr = Zt + pi, Jr = Zt + gs, ei = Bs + gi, es = Qe + "Rule", Hl = ee + "ionStart", Zr = "set" + pi, br = Fs + "s" + gi, ef = Ci + "Area", Je = "tar" + Xt, Tt = ye + "area", Ze = ye + ws, tf = "async" + Dl, Js = Xt + Xs + "Descriptor", lf = Js + "s", sf = "has" + Xs, Zs = (e, t, l, i) => `the ${e} ${t} ${di} ${l}, ` + bs(i), bs = (e) => `but got ${e} instead.`, v = (e, ...t) => e.push(...t), Pi = (e, t) => e.sort(t), he = (e, t) => e.join(t), d = (e, t) => e.forEach(t), G = (e, t, l) => e.map(t, l), pt = (e, t, l) => e.filter(t, l), Di = (e, t, l) => e.find(t, l), ki = (e, t, l) => e.every(t, l), rf = (e, t, l) => e.findIndex(t, l), er = (e, t, l) => e.indexOf(t, l), tr = (e, t) => t[1] - e[1], He = (e) => Array.from(e), ts = (e, t = 0) => G(He({ [Vl]: e }), (l, i) => t + i), j = (e) => e.trim(), Ce = (e) => e.toLowerCase(), B = (e, t, l) => e.split(t, l), xi = (e, t) => e.match(t), lr = (e) => e.toUpperCase(), ff = (e) => lr(e[0]) + Te(e, 1), nf = (e) => Ce(e[0]) + Te(e, 1), be = (e, t, l) => e[br](t, l), ls = (e, t, l) => e[Yr](t, l), Oe = (e, t) => t.test(e), J = (e, t, l) => e[Bs](t, l), af = (e, t, l) => {
  for (; Oe(e, t); )
    e = J(e, t, l);
  return e;
}, cf = (e) => Oe(e, /^\d+$/), Ef = (e) => Oe(e, /^(\w|\s|\.|\$|`|'|"|(\[(.|\s)+?\]))*;?$/g) && !be(e, z + " "), ir = (e) => Oe(j(e), /^((async\s+)?function\s*\([^)]*\)\s*{[^}]*}|(async\s*)?(?:\([^()]*\)|[$\w]+)\s*=>)/), of = (e) => nf(he(G(B(e, "-"), ff), "")), sr = (e) => JSON.stringify(e), Li = (e, t) => {
  try {
    e = JSON.parse(e, t);
  } catch {
  }
  return e;
}, mi = (e) => "`" + J(e, /`/g, "\\`") + "`", jt = (e) => Ce(Te(Ie[Qs][xr].call(e), 8, -1)), nt = (e, t) => jt(e) === t, Ee = (e) => e === it, st = (e) => e === Se, _e = (e) => nt(e, Jt), ie = (e) => nt(e, At), bt = (e) => Tf(e) || uf(e), Tf = (e) => nt(e, Dl), uf = (e) => nt(e, tf), ge = (e) => nt(e, Ge), ti = (e) => nt(e, ae) && isFinite(e), yf = (e) => nt(e, nl), pf = (e) => wt(e, rr), wt = (e, t) => e instanceof t, Rt = (e) => wt(e, Node), Af = (e) => wt(e, Text), St = (e) => wt(e, HTMLElement), li = (e) => wt(e, Map), hf = (e) => wt(e, Set), Pe = window, Ie = Object, Pt = Reflect, El = location, dt = Pe[hi], Rf = Symbol, rr = RegExp, V = (e, t, l) => _e(e) && t in e ? e[t] : l, Sf = (e) => {
  let t = Nl();
  for (; t in e; ) t = Nl(12);
  return t;
}, Ut = (e) => x(oe(e)), oe = (e) => Ie.keys(e), Of = (e = it) => Ie[Xe](e), _f = (e, t = {}) => {
  const l = Of(e);
  return Ie[Kr](
    l,
    Ie[lf](t)
  ), l;
}, If = (e, t, l = Ie) => l[Js](e, t), Nf = (e) => Ie.getPrototypeOf(e), re = (e, t) => Ie[Qs][sf].call(e, t), wf = [
  ["w", "writable"],
  ["e", "enumerable"],
  ["c", "configurable"]
], le = (e, t, l = Se, i = {}) => {
  let s = "";
  ge(i) && (s = i, i = {}), d(wf, ([a, c]) => {
    re(i, a) ? i[c] = i[a] : re(i, c) || (i[c] = !U(s, a));
  }), i[g] = l, Ie[Jl](e, t, i);
}, Mi = (e, t = {}) => {
  d(oe(e), (l) => {
    le(e, l, e[l], t);
  });
}, el = (e, t) => delete e[t], fr = (e) => d(oe(e), (t) => {
  el(e, t);
}), fe = (e = Se) => new Map(e), Ue = (e = Se) => new Set(e), df = (e, t) => new rr(e, t), Bt = (e, t) => {
  if (e === t) return e;
  if (ie(e) && ie(t)) {
    for (; x(e) > x(t); ) e.pop();
    for (let l = 0; l < x(t); l++)
      l < x(e) ? e[l] = Bt(e[l], t[l]) : e.push(qe(t[l]));
  } else if (li(e) && li(t)) {
    let l = fe(e);
    e.clear();
    for (let [i, s] of Ct(t))
      e.set(i, l.has(i) ? Bt(l.get(i), s) : qe(s));
  } else if (e instanceof Set && t instanceof Set) {
    e.clear();
    for (let l of t)
      e.add(l);
  } else if (_e(e) && _e(t)) {
    let l = { ...e };
    fr(e);
    for (let i in t)
      re(t, i) && (e[i] = re(l, i) ? Bt(l[i], t[i]) : qe(t[i]));
  } else
    return t;
  return e;
}, qe = (e) => {
  let t = e;
  if (_e(e)) {
    let l = {};
    for (let i in e)
      re(e, i) && (l[i] = qe(e[i]));
    t = l;
  }
  return ie(e) && (t = G(e, qe)), li(e) && (t = fe(G(He(Ct(e)), ([l, i]) => [l, qe(i)]))), hf(e) && (t = Ue(G(He(e), qe))), t;
}, U = (e, t, l) => e.includes(t, l), Ct = (e) => _e(e) ? Ie[Gi](e) : e[Gi](), Te = (e, t, l) => e.slice(t, l), x = (e) => st(e[Vl]) ? e.size : e[Vl], Be = (e, t = 0) => setTimeout(e, t), Il = (e, t) => {
  let l;
  return (...i) => {
    clearTimeout(l), l = Be(() => e(...i), t);
  };
}, Cf = (e, t) => {
  let l = 0;
  return (...i) => {
    let s = Date.now();
    if (!(s - l < t))
      return l = s, e(...i);
  };
}, $f = () => crypto.randomUUID(), Nl = (e = 8) => "b" + Te(J($f(), /-/g, ""), 0, e - 1), nr = (e, ...t) => console[e]("Brio.js", ...t), vi = (...e) => nr("warn", `warn:
`, ...e), F = (...e) => nr(jl, `detected an ${jl}:
`, ...e), Ot = (e, t = dt) => He(t.querySelectorAll(e)), K = (e, t = dt) => ge(e) ? Ot(e, t)[0] : e, Le = (e, t, ...l) => e[t](...l), gf = (e, t, l) => {
  t == ce || t == Ve ? e[t] = l : e[jr](t, l);
}, Pf = (e, t, l) => {
  l && Fe(l) ? Le(l, De, e) : Le(t, yi, e);
}, ii = (e) => e[Hr](!0), ar = (e, t) => d(He(e.attributes), ({ name: l, value: i }) => t(l, i)), _t = (e) => e[Zt](), Fe = (e) => e[qr], Df = (e) => e[Wr], cr = (e) => j(e[Ze] || ""), je = (e) => [...e.childNodes], Y = (e, t) => e[Gr](t), Hi = (e, t, l, i) => {
  i && (e[i] = l), e[Zr](t, l);
}, tl = (e, t) => e[Qr](t), Er = (e, t) => dt[zr](e, t), kf = (e) => dt[Fr](e), xf = (e) => new DOMParser().parseFromString(e, ye + "/" + ht), Re = (e) => Ce(e.tagName || ""), de = (e, t, l, i) => (ge(e) && (e = K(e)), e[Lr](t, l, i), () => e[Jr](t, l)), et = (e, t, l) => K(e).dispatchEvent(new CustomEvent(Ce(J(t, /[^a-z\d]/gi, "")), {
  bubbles: !0,
  cancelable: !0,
  [ds]: l
})), si = async (e, t) => {
  if (await t(e))
    for (let l of je(e))
      await si(l, t);
}, Lf = (e) => e[Je][Ol] = !0, mf = (e) => {
  let t = e[Je];
  t[Ol] && (t[Ol] = !1, et(t, W));
}, or = (e) => Pe.getComputedStyle(e), Mf = (e) => {
  let t = or(e);
  return !(!Fe(e) || t[Gl] == "none" || t.visibility == "hidden" || t.opacity == "0");
}, vf = (e, t) => new URL(e, t), ol = (e = "", t = ji) => vf(e, El[ji])[t], Tr = (e) => U([g, ot, ee + "ed"], e), Hf = (e) => J(J(e, /[^a-z0-9_-]/gi, ""), /^[^a-z_]+/i, ""), Uf = (e, t, l) => async (i, s, a, c) => {
  let f = s == Ni ? Ve : s == Pl ? ce : s == ye ? Ze : s == De ? De + Ml : s == "first" ? We + Ml : s == "last" ? De + al : s == We ? We + al : s, n = "$dom." + Qt, r = K(a), E = K(Ds), o = K(dr);
  if (!r) return F(n, tt, Kt);
  (E == r || o == r) && (f = ce);
  let T = K(ht) == r, O = f == Ze, R = O || f == ce, h = f == Ve, p = R ? r : Fe(r);
  if (!p && !T) return F(n, Yt, tt, Kt);
  i = await i, i in l && (i = l[i]());
  let P = Rt(i) ? i : xf(i), $ = V(c, ee);
  $ && (i = K($, P)), Rt(i) && (i = i[Ve]), (h || T) && t(r, !1), R && d(je(r), (C) => t(C));
  let k = Ue(je(r));
  p && d(je(p), (C) => k.add(C));
  let X = (C) => pt(je(C), (_) => !k.has(_)), H = [];
  T ? (r[ce] = K(ht, P)[ce], H = [r, ...Ot(Q, r)]) : R ? (r[O ? Ze : ce] = i, H = je(r)) : h ? (r[Ve] = i, H = X(p)) : (gf(r, f, i), H = X(f == De + Ml || f == We + al ? p : r)), Pi(H, (C, _) => {
    let w = Re(C) == se, N = Re(_) == se;
    return w && !N ? -1 : N && !w ? 1 : 0;
  }), d(H, (C) => {
    if (
      // is script element
      Re(C) == Q && // is not b-script
      Ee(Y(C, m + Q)) && // should load: !(b-load-once attribute AND script already loaded)
      !(!Ee(Y(C, "b-load-" + Ms)) && Sr.has(Y(C, "src")))
    ) {
      let _ = Er(Q);
      ar(C, (w, N) => Hi(_, w, N, Tr(w) && w)), _[ce] = C[ce], Le(C, ei, _);
    }
  }), V(c, lt, !0) && d(H, (C) => e(C, r));
  let ne = V(c, "then");
  ne && await ne(H);
}, Ul = (e, t = "", l = "") => {
  let i = t == It ? FormData : URLSearchParams, s = new i(), a = (c, f = "") => {
    _e(c) || ie(c) ? d(Ct(c), ([n, r]) => {
      let E = f ? `${f}[${n}]` : n;
      a(r, E);
    }) : s[yi](f, c);
  };
  return a(e, l), s;
}, Dt = (e) => async (t, l, i = {}) => {
  let s = "status", a = ws + "-Type", c = V(i, "parser");
  if (_e(l)) {
    let f = i[bi] || {}, n = Di(oe(f), (E) => Ce(E) == Ce(a)), r = Ce(f[n] || "");
    el(f, n), e == Xt || e == z ? (t += Ul(l), l = Se) : ls(r, "json") ? (l = sr(l), f[a] = "application/json") : ls(r, "form-data") ? l = Ul(l, It) : l = Ul(l), i[bi] = f;
  }
  try {
    let f = await fetch(t, { ...i, [gr]: e, body: l });
    if (!f.ok) {
      let r = new Error(`HTTP ${jl}! ${s}: ${f[s]}`);
      throw r.response = f, r;
    }
    let n = await f[c || ye]();
    if (!c)
      try {
        n = Li(n);
      } catch {
      }
    return n;
  } catch (f) {
    throw f;
  }
}, wl = {
  get: Dt(Xt),
  post: Dt(Pr),
  put: Dt(Us),
  [Xi]: Dt(Xi),
  [z]: Dt(z)
}, Bf = (e, t, l) => [
  // Set a route
  (i, s) => {
    if (bt(s)) {
      i = ol(i, vl);
      let a = pt(B(i, "/"), j), c = x(a) - 1, f = e;
      d(a, (n, r) => {
        n in f || (f[n] = {}), f = f[n], r == c && (f[vt] = s);
      });
    } else F(Is, "set route without a", Qe, Dl, we, i);
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
  (i) => {
    if (!be(ol(i), El.origin))
      return El.href = i, it;
    i = ol(i, vl);
    let s = pt(B(i, "/"), j), a = e, c = {}, f = 0;
    for (let n of s) {
      if (f = 0, n in a && !be(n, ":"))
        a = a[n], f = 1;
      else for (let r of oe(a))
        if (be(r, ":")) {
          let [E, o] = pt(B(r, ":"), j);
          if (!o || o && o in t && t[o](n)) {
            let T = c[E];
            T ? ie(T) ? v(T, n) : c[E] = [T, n] : c[E] = n, a = a[r], f = 1;
            break;
          }
        }
      if (!f) break;
    }
    return f = f && a[vt] ? 1 : 0, f ? a[vt]({
      params: c,
      path: i,
      [Zt]: () => el(a, vt)
    }) : l(wl.get(i), Ni, ht), i != El[vl] && history.pushState(it, "", i), !!f;
  }
], Tl = [], Ff = () => {
  let e = fe(), t = (l, i) => {
    let s = Tl.find((a) => a[Ys](l));
    if (s)
      return e.has(l) || s[hl](l, () => {
        e.get(l)();
      }), e.set(l, i), s;
    F(ui, Ri, Kt, we, l);
  };
  return [
    /**
     * Plays the animation towards the end
     * 
     * When used with $hook, this function is usually called before the main hook function
     * 
     * This allows the animation to transition the element out of view
     */
    (l, i = !1, s) => {
      let a = V(s, Z, () => {
      }), c = V(s, Me, () => {
      });
      !e.has(l) && !i && a();
      let f = t(l, a);
      !f || i ? a() : (c(), f.play(l, a));
    },
    /**
     * Plays the animation towards the start (in reverse)
     * 
     * When used with hook, this function is usually called after the main hook function
     * 
     * This allows the animation to transition the element into view
     */
    (l, i = !0, s) => {
      let a = V(s, Z, () => {
      }), c = V(s, Me, () => {
      }), f = t(l, a);
      f && i ? (c(), f[b](l, a)) : a();
    }
  ];
}, zf = (e) => {
  if (!e || !ki([xt, Ys, Z, b, hl], (t) => t in e))
    F(Oi, ui, Ri, e ? e[xt] : "");
  else {
    let t = rf(Tl, (l) => l[xt] == e[xt]);
    t >= 0 ? Tl[t] = e : v(Tl, e);
  }
};
const Kf = Ue([
  // ECMAScript reserved keywords
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
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
  "super",
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
let dl = /^[a-z_$][\w$]*$/i, Yf = (e) => {
  let t = /[a-z_$][\w$]*/gi, l = Ue(), i = [
    /\b(?:var|let|const)\s+([a-z_$][\w$]*)/gi,
    /\bfunction\s+([a-z_$][\w$]*)/gi,
    /\bclass\s+([a-z_$][\w$]*)/gi,
    /\bimport\s+([a-z_$][\w$]*)/gi,
    /\bfunction\s*[^(]*\(([^)]*)\)/g,
    /\(([^)]*)\)\s*=>/g,
    /\b([a-z_$][\w$]*)\s*=>/gi
  ];
  for (let o of i) {
    let T;
    for (; (T = o.exec(e)) !== null; ) {
      let O = T[1];
      if (O) {
        let R = G(B(O, ","), (h) => J(j(h), /=.*$/, ""));
        for (let h of R)
          h.match(dl) && l.add(h);
      }
    }
  }
  let s = [], a = /(['"`])(?:\\[\s\S]|(?!\1)[^\\])*\1/g, c = /\$\{([\s\S]*?)\}/g, f;
  for (; (f = a.exec(e)) !== null; ) {
    let o = f[1], T = f[Ye], O = T + x(f[0]);
    if (o === "`") {
      let R = f[0], h = f[Ye], p = 0, P;
      for (; (P = c.exec(R)) !== null; ) {
        let $ = P[Ye] + 2, k = $ + x(P[0]) - 3;
        $ > p && v(s, [
          h + p,
          h + $
        ]), p = k;
      }
      p < x(R) && v(s, [
        h + p,
        h + x(R)
      ]);
    } else
      v(s, [T, O]);
  }
  let n = Ue(), r = /{([^}]+)}/g;
  for (; (f = r.exec(e)) !== null; ) {
    let o = f[1], T = f[Ye], O = B(o, ",");
    for (let R of O)
      if (U(R, ":")) {
        let [h] = G(B(R, ":"), (p) => j(p));
        if (h && Oe(h, dl)) {
          let p = er(e, h, T);
          p !== -1 && n.add(p);
        }
      }
  }
  let E = [];
  for (; (f = t.exec(e)) !== null; ) {
    let o = f[0], T = f[Ye], O = e[T - 1];
    Kf.has(o) || l.has(o) || O === "." || n.has(T) || s.some(([R, h]) => T >= R && T < h) || v(E, [
      o,
      T,
      // start index of the variable
      T + x(o)
      // end index of the variable
    ]);
  }
  return E;
}, Gf = (e, t) => {
  let l = Yf(t), i = "", s = 0, a = e.ctx;
  for (let [c, f, n] of l)
    if (!(c in a)) {
      for (let r of [Gt, Sl, Xl, Ss, Os])
        if (a[r] && c in a[r]) {
          i += t.slice(s, f) + `${r}.${c}`, s = n;
          break;
        }
    }
  return i + t.slice(s);
}, jf = (e) => Ui(({ prop: t, state: l }) => (Vt(l)[ft].add(t), e)), ri = !1, fi = [], ur = (e) => (fi = [], ri = !0, e({}), ri = !1, [...fi]), yr = (e) => {
  let t = ur(e), l = x(t);
  if (l) {
    let [i, s] = t[l - 1];
    return (a) => st(a) ? i[s] : i[s] = a;
  }
}, ue = (e, t) => {
  if (!is(e) || Wt(e)) return e;
  let l = V(t, Yt, it);
  t = { [Yt]: l };
  let i = {
    get(f, n) {
      return ri && (re(f, n) || !(n in f)) && v(fi, [s, n]), Pt.get(f, n, s);
    },
    set(f, n, r) {
      n in f || le(f, n);
      let E = s[n];
      if (E === r) return !0;
      let o = Vt(s), T = {
        [Je]: f,
        [Ne]: s,
        prop: n,
        [Lt]: E
        // [NEW_VALUE]: newValue,
        // [OPERATION]: UNDEFINED,
      };
      Mi(T, "wc"), Mt.has(r) && (Mt[z](r), r = r(T)), a.has(n) || (r = ue(r)), T[yt] = r, Wf(T);
      let O = Pt.set(f, n, r, s);
      return ss(o, T), O;
    },
    [Zi](f, n) {
      let r = f[n], E = Pt[Zi](f, n);
      return ss(Vt(s), {
        [Je]: f,
        [Ne]: s,
        prop: n,
        [Lt]: r,
        [yt]: Se,
        [Ii]: z
      }), E;
    },
    [Jl](f, n, r) {
      let E = r[g], o = s[n];
      return Mt.has(E) && (r[g] = E({ [Ne]: s, prop: n, [yt]: E, [Lt]: o })), !a.has(n) && g in r && (r[g] = ue(r[g])), Pt[Jl](f, n, r);
    }
  };
  const s = new Proxy(Wt(l) ? _f(l, e) : e, i), a = Ue();
  let c = {
    // [PARENT]: parent,
    // [TARGET]: target,
    // proxied,
    [Ne]: fe(),
    [Ae]: {},
    skip: a
    // refs: [],
    // [ON_SET]: {},
  };
  kl.set(s, c);
  for (let f in e) {
    let n = e[f];
    Mt.has(n) && (n = n({
      [Je]: e,
      [Ne]: s,
      prop: f,
      [Lt]: Se
    })), !a.has(f) && is(n) && Pt.set(e, f, n, s);
  }
  return s;
}, is = (e) => ie(e) || _e(e), ss = (e, t) => {
  let l = fe(), i = e[Ae][t.prop];
  i && d(i, (a, c) => l.set(c, a)), d(e[Ne], (a, c) => l.set(c, a));
  let s = He(l);
  Pi(s, tr);
  for (let [a] of s) a(t);
}, Wf = (e) => {
  e[Ii] = st(e[Lt]) ? Xe : st(e[yt]) ? z : ql;
}, pr = "getItem", Ar = "setItem", ni = fe(), Vf = (e) => {
  let t = Nf(e);
  return t && re(t, pr) && re(t, Ar);
}, ai = (e, t) => Li(e[pr](t) || ""), rs = (e, t, l) => e[Ar](t, sr(l)), fs = (e) => "_b_" + e, hr = (e, t, l) => Vf(e) ? (l && (l = fs(l), re(e, l) && (t = ai(e, l))), Ui(({ state: s, prop: a }) => (ni.set(l, [s, a, e]), l = l || fs(a), re(e, l) ? t = ai(e, l) : rs(e, l, t), Be(() => zt(s, a, () => {
  rs(e, l, s[a]);
})), t))) : F(Oi, Ci, Jt), qf = (e) => {
  if (ni.has(e.key)) {
    let [t, l, i] = ni.get(e.key);
    i === e[ef] && (t[l] = ai(i, e.key));
  }
}, Ft = (e, t, l = 0) => {
  let i = [], s = ur(t || e);
  return d(s, ([a, c]) => {
    v(i, Rr(a, c, e, l));
  }), t && e({}), () => d(i, (a) => a());
}, zt = (e, t, l, i = 0) => {
  let s;
  return Wt(e) ? /*hasProp(proxied, prop as string)*/ t || t === 0 ? s = Rr(e, t, l, i) : s = Qf(e, l, i) : (F(Is + `watch non-${Ne} ${Jt}/${At}.`), s = () => {
  }), s;
}, kl = fe(), Mt = Ue(), Ui = (e) => Mt.add(e) && e, Wt = (e) => kl.has(e), Vt = (e) => kl.get(e), Xf = (e) => kl[z](e), Qf = (e, t, l = 0) => {
  if (Wt(e)) {
    let i = Vt(e)[Ne];
    return i.set(t, l), () => i[z](t);
  }
}, Rr = (e, t, l, i = 0) => {
  let s = Vt(e)[Ae];
  return s[t] || (s[t] = fe()), s[t].set(l, i), () => s[t][z](l);
};
le(ue, "persist", (e, t) => hr(localStorage, e, t), "wc");
le(ue, "session", (e, t) => hr(sessionStorage, e, t), "wc");
le(ue, "init", Ui, "wc");
le(ue, ft, jf, "wc");
let Cl = (e, t, l = !0) => new Function(e, l ? `return(${t})` : t), Jf = (e, t) => t ? mi(e) : ut(e), xl = (e, t = "", l = !0) => (Ef(e) && !l && (e += `(${t})`), ir(e) || (e = Jf(e, l == ye), e = `(${t})=>` + (l ? `(${e})` : `{${e}}`)), e), ns = (e, t, l) => {
  let i = e.get(t);
  return i && i[l];
}, Zf = (e) => [
  // Adds a hook to a target
  (t, l, i, s = 0) => {
    bt(i) && (e.has(t) || e.set(t, {}), e.get(t)[l] || (e.get(t)[l] = fe()), ns(e, t, l).set(i, s));
  },
  // Calls all the functions under a hook name on a target by priority
  async (t, l, i) => {
    let s = ns(e, t, l);
    if (s && x(s)) {
      let a = He(s);
      Pi(a, tr);
      let c = -1, f = !0, n = async () => {
        if (c++, f = !0, c < x(a)) {
          let r = c;
          await a[r][0](
            /** Contextual data, if any */
            i,
            {
              /** Call the next function */
              play: n,
              /** Disable the auto-run feature and choose when/if to call the next function */
              [Me]: () => f = !1,
              /** Remove the current function */
              [Zt]: () => s[z](a[r][0])
            }
          ), f && await n();
        }
      };
      await n();
    }
  }
], vt = Rf(fl), Bi = {}, Sr = Ue(), Xn = () => {
  let e = (y) => O.get(y), t = (y, A = () => !0) => {
    let u = y ? Fe(y) : it;
    for (; u; ) {
      let S = e(u);
      if (S && Ut(S[xe]) && A(S)) return S;
      u = Fe(u);
    }
  }, l = (y, A) => {
    let u = e(y);
    if (!u) {
      let S = A ? e(A) : t(A || y);
      u = {
        // Local context
        // @ts-ignore
        ctx: { ...ze },
        // A reference to the element. Convenience for internal use.
        el: y,
        // UID context
        uid: V(S, "uid", {}),
        /** Attributes or directives */
        attr: {},
        /** Cleanup functions */
        cFns: [],
        ...$t,
        ...gt
      };
      for (let I in H) {
        let D = H[I](u, S);
        D && le(u.ctx, I, D, "wc");
      }
      O.set(y, u);
    }
    return u;
  }, i = (y, A, u, S) => {
    let I = y.el;
    ne(I, A, S(I));
    let D = T(y, u);
    q(y, Ft(() => C(I, A, D)));
  }, s = (y, A) => {
    ge(y) && (y = K(y)), ge(A) && (A = K(A)), Rt(A) || (A = Se), Rt(y) && (r(y), si(y, async (u) => {
      let S = !1, I = y == u ? A : Se;
      return Af(u) && cr(u) ? S = c(u, I) : St(u) && (Re(u) == Q && Ee(Y(u, m + Q)) ? S = !1 : S = await f(u, I)), S;
    }));
  }, a = (y, A = !0, u = !0) => {
    si(y, (S) => {
      let I = e(S);
      return I && (I.nodes && d(I.nodes, (D) => I[_l](D, A, u)), d(I.cFns, (D) => D()), u && O[z](S), A && _t(S)), !0;
    });
  }, c = (y, A) => {
    let u = y[Ze], S = Or(ut(u || ""));
    if (S && Oe(S, yl)) {
      let I = l(y, A), D = T(I, `$el.${Ze}=${mi(S)}`, "", !1);
      q(I, Ft(D)), ul(I, ye, u);
    }
    return !1;
  }, f = async (y, A) => {
    let u = l(y, A);
    if (!st(kt(u))) return !0;
    u[$e] = n(u, m + $e)();
    for (let [S, I] of h) {
      let D = [];
      if (pf(S))
        ar(y, (pe, Ke) => {
          Oe(pe, S) && v(D, [pe, Ke]);
        });
      else {
        let pe = Y(y, S);
        Ee(pe) || v(D, [S, pe]);
      }
      for (let [pe, Ke] of D) {
        if (kt(u)) break;
        ul(u, pe, Ke), await I(u, pe, ut(Ke));
      }
      if (kt(u)) break;
    }
    return st(kt(u)) && (u[ft] = !1), !Ut(u[xe]) && !A && O[z](y), !kt(u);
  }, n = (y, A, u = "{}") => {
    let S = Y(y.el, A);
    return Ee(S) || ul(y, A, S), S = ut(S || u), T(y, S);
  }, r = (y) => {
    if (St(y)) {
      let A = Ot(te + `,[${mt}]`, y);
      (Y(y, mt) || Re(y) == te) && v(A, y), d(A, (u) => {
        let S = Y(u, mt);
        tl(u, mt);
        let I = Re(u);
        if (I == te && d(je(u[Ns]), (D) => r(D)), S) {
          let D = I == Q, pe = D ? Q : I == se ? se : te, Ke = u[I == te ? Ve : ce];
          gt[pe][S] = D ? Cl(ml, ut(Ke), !1) : Ke, Ee(Y(u, m + lt)) && _t(u);
        }
      });
    }
  }, E = (y) => (A, u) => {
    gt[y][A] = u;
  }, o = (y, A, u = "", S = !0) => {
    let I;
    return A = xl(A, u, S), A in X ? I = X[A] : (I = Sf(k), k[I] = Cl(ml, Gf(y, A)), X[A] = I), I;
  }, T = (y, A, u = "", S = !0) => {
    let I;
    try {
      let D = A in k ? A : o(y, A, u, S);
      I = k[D](y.ctx);
    } catch (D) {
      F(D.message), I = () => vt;
    }
    return I;
  }, O = fe(), R = fe(), h = [], p = {}, P = {}, $ = { [ae]: cf }, k = {}, X = {}, H = {
    // The element itself
    $el: (y) => y.el,
    // Unique identifier for the element
    $uid: (y) => (A) => `${A}-${y.uid[A]}`,
    // Reactive properties defined in the element or inherited from the parent context
    [Xl]: as(Xl, m + Ae, !0),
    // The $data context
    [Sl]: as(Sl, ve),
    // Data Level Context:
    // Referenced under the same $data context, not including nested $data contexts
    $refs: cs("$refs"),
    $slots: cs("$slots"),
    // The $each context
    [Gt]: (y, A) => A == null ? void 0 : A.ctx[Gt]
  }, [ne, C] = Zf(R), _ = Uf(s, a, p), [w, N] = Bf(P, $, _);
  Bi[Qe] || Es(N);
  let M = ui + lr(Ri), L = {
    hook: ne,
    [Qe]: w,
    router: Es,
    [es]: E(es + "s"),
    [te]: E(te),
    [se]: E(se),
    [Q]: E(Q),
    [Ae]: E(Ae),
    data: E(It),
    mask: E(Zl),
    [qs]: E(bl),
    [M]: zf
  }, $t = {
    [lt]: s,
    [_l]: a,
    [Qt]: _,
    [Qe]: N,
    emit: et,
    listen: de,
    query: K,
    queryAll: Ot,
    /** Get the closest parent element of a target element that has a directive (b-data by default) */
    [Yi](y, A = ve) {
      let u = t(K(y), (S) => A in S[xe]);
      return u || F(Yi + ":", tt, Kt), u == null ? void 0 : u.el;
    },
    /** Get the local context of an element */
    context: (y) => {
      var A;
      return (A = e(K(y))) == null ? void 0 : A.ctx;
    }
  }, ze = {
    $dom: $t,
    $http: wl,
    $set: L,
    [Ss]: ue({}),
    $state: ue,
    $watch: zt,
    $effect: Ft,
    [Os]: {
      hasProp: re,
      getProp: V,
      setProp: le,
      sync: Bt
    }
  }, ml, Ki = () => ml = `{${he(oe(ze))},${he(oe(H))}}`;
  Ki();
  let gt = {
    [te]: p,
    [se]: {},
    [Q]: {},
    [Ae]: {},
    data: {},
    // ! HYDRATION
    lcFns: H,
    [Vs]: h,
    bnodes: O,
    hooks: R,
    [Zl]: {},
    [bl]: {},
    routes: P,
    routeRules: $,
    // ! PUBLIC CONTEXT
    gc: ze,
    // ! TOOLS
    exec: T,
    [vr]: o,
    [Si]: Ki,
    [rt]: i,
    bnode: [l, e],
    hook: [ne, C],
    [Ht]: Ff()
    // insert,
    // route: [SetRoute, Route],
  };
  return d([L, $t, wl, ze, gt], (y) => Mi(y, "wc")), gt;
}, kt = (e) => e.skip, q = (e, t) => {
  v(e.cFns, t);
}, ul = (e, t, l) => {
  e[xe][t] = l, St(e.el) && tl(e.el, t);
}, ut = (e) => J(j(he(G(B(e, we), (t) => be(j(t), "//") ? "" : t), we)), /;$/, ""), yl = /\${((?!.*\${).*?)}/, bf = /{{((?!.*{{).*?)}}/, Or = (e, t = "${$1}") => af(e, bf, t), as = (e, t, l) => (i, s) => {
  let a = i.el, c = s ? s.ctx[e] : it, f = St(a), n = f && !Ee(Y(a, t)), r = f && (!c || n);
  return r && !n && t == ve && Hi(a, ve, ""), r ? ue({}, { [Yt]: l && c }) : c || {};
}, cs = (e) => (t, l) => !l || St(t.el) && !Ee(Y(t.el, ve)) ? {} : l.ctx[e], Es = (e) => {
  bt(e) && (Bi[Qe] = () => e(ol()));
}, Qn = (e = {}) => {
  fl in Pe || (Mi(e, "wc"), le(Pe, fl, e, "wc"), de(Pe, Ci, qf), de(Pe, "pop" + Ne, Bi[Qe]), et(Pe, fl));
}, Ll = (e, t) => Te(e, be(e, m) ? t : t - 2), en = async (e, t) => {
  e[ft] = !0;
}, tn = [js, en], ln = (e, t, l) => {
  let i = e.el, [s, a] = e.bnode, [c, f] = e.hook;
  e[ft] = !0;
  let [n, r] = G(B(l, " in "), j), [E, o] = G(B(n, ","), j);
  o || (o = Ye);
  let T = `the ${t} ${me} ` + di;
  if (!Oe(E, dl) || !Oe(o, dl))
    return F(T, "a valid alias.");
  let O = e.exec(e, r), R = yr(O), h = R ? R() : O(), p = R && Wt(h);
  if (ti(h) && (h = ue(ts(h, 1)), R && Ft(() => {
    let _ = R();
    ti(_) && Bt(h, ts(_, 1));
  }, () => R())), !(ie(h) || _e(h)))
    return F(T, `an ${At}, ${Jt}, or ${ae}.`);
  let P = Df(i), $ = Fe(i);
  _t(i);
  let k = {}, X = t + "-" + Xe, H = t + "-" + ql, ne = t + "-" + z;
  c(i, X, ([_, w]) => {
    let N = ii(i);
    Pf(N, $, P);
    let M = s(N);
    ul(M, "", "");
    let L = ue({});
    le(L, E, w, "c"), le(L, o, _, "c"), le(M.ctx, Gt, L, "wc"), q(M, zt(L, o, ({ [yt]: $t }) => {
      let ze = k[_][1];
      $t !== ze && (L[o] = ze);
    })), p && q(M, zt(L, E, () => {
      h[L[o]] = L[E];
    })), k[_] = [N, _], e[lt](N);
  }), c(i, H, ([_, w]) => {
    let N = k[_], M = a(N && N[0]);
    if (M) {
      let L = M.ctx[Gt];
      L[E] = w, L[o] = _, N[1] = _;
    }
  }), c(i, ne, ([_, w]) => {
    let [N] = k[_];
    e[_l](N), el(k, _);
  });
  let C = {
    [Xe]: (_) => f(i, X, _),
    [ql]: (_) => f(i, H, _),
    [z]: (_) => f(i, ne, _)
  };
  for (let _ of Ct(h))
    C[Xe](_);
  R && q(e, zt(h, Se, ({ [Ii]: _, prop: w, [yt]: N }) => {
    C[_]([w, N]);
  }));
}, sn = [mr, ln], rn = async (e, t, l) => {
  let i = Y(l, t);
  if (i) {
    let s = e.ctx.$refs;
    s[i] = l, tl(l, t);
  }
}, fn = async (e, t, l) => {
  let i = Y(l, t);
  i && (tl(l, t), e.ctx.$slots[i] = l[Ve], _t(l));
}, _r = async (e, t, l) => {
  let [i, s] = e.hook, a = t == ve, c = a ? It : Ae, f = e[c], n = l ? f[l] || Cl(e[Si](), l) : () => ({}), r = e.ctx[qt + c];
  i(e.el, t, async () => {
    let E = await n(e.ctx);
    if (!_e(E))
      return e[ft] = !0, F(Zs(me, t, "an " + Jt, jt(E)));
    for (let o in E) le(r, o, E[o], If(E, o));
    a && (await Fi(e), q(e, async () => {
      Xf(e.ctx[Sl]);
      for (let o in r) delete r[o];
    }));
  }), await s(e.el, t, r);
}, nn = [m + Ae, _r], an = [ve, _r], Bl = (e, t) => `:not([${t}]):not([${t}] [${e}])`, cn = (e) => {
  let t = Bl(e, ve) + Bl(e, mt) + Bl(e, js);
  return `[${e}]${t},${te + t}`;
}, Ir = (e, t) => {
  let l = [];
  return d(Ot(e, t), (i) => {
    Re(i) == te ? d(Ir(e, i[Ns]), (s) => v(l, s)) : v(l, i);
  }), l;
}, os = async (e, t, l) => {
  let [i, s] = e.hook, a = e.el;
  i(a, t, () => {
    let c = [];
    d(e.nodes || [a], (f) => {
      if (St(f)) {
        let n = Ir(cn(t), f);
        v(c, f, ...n);
      }
    }), d(c, (f) => l(e, t, f));
  }), await s(a, t);
}, Fi = async (e) => {
  await os(e, "b-ref", rn), await os(e, "b-slot", fn);
}, ll = {}, En = async (e, t, l) => {
  if (l) {
    let i = e.el, [s, a] = e.hook;
    s(i, t, () => {
      let c = e.exec(e, l)();
      if (!ie(c) || !ki(c, ge))
        return F("the", t, me, xs, `an ${At} of ${Ge}(s).`);
      e.uid = c.reduce((f, n) => (n in ll ? ll[n]++ : ll[n] = 1, f[n] = ll[n], f), {});
    }), await a(i, t);
  }
}, on = ["b-uid", En], Nr = (e) => (t, l, i) => {
  if (!t[xe][Ws] && !t[xe][Gs]) {
    let s = t[te];
    i in s && (i = mi(s[i] || i)), i && t[rt](t, l, i, (a) => async (c) => {
      await t[Qt](c(), e, a), e == Pl && await Fi(t);
    });
  }
}, Tn = [Gs, Nr(Pl)], un = [Mr, Nr(ye)], yn = async (e, t, l) => {
  let i = e.el, s = l ? e[te][l] || e.exec(e, l)() : i[ce], [a, c] = e.hook;
  a(i, t, async () => {
    ge(s) ? (await e[Qt](s, De, i, {
      then: (f) => {
        e.nodes = f;
      }
    }), _t(i), await Fi(e)) : vi(t + ":", Oi, g, `
`, s);
  }), await c(i, t);
}, pn = [Ws, yn], An = async (e, t, l) => {
  let i = e.el, s = e[Q], a = Re(i) == Q;
  e.skip = a;
  let [c, f] = e.hook, n = l ? s[l] || e.exec(e, l)() : [];
  n = G(
    ie(n) ? n : [n],
    (r) => s[r] || r
  ), c(i, t, async () => {
    if (a) {
      let r = Y(i, "src");
      r && Sr.add(r);
      let E = r ? await wl.get(r) : cr(i);
      E && v(n, ut(E)), _t(i);
    }
    for (let r of n) {
      let E = r;
      if (ge(E)) {
        let o = ir(E);
        E = Cl(e[Si](), E, o), o && (E = E(e.ctx));
      }
      bt(E) && await E(e.ctx);
    }
  }), await f(i, t);
}, hn = [m + Q, An], Rn = (e, t, l) => {
  let i = e.el;
  if (l && Re(i) != se) {
    let [s, a] = e.hook, c = e[se], f = c[l] || e.exec(e, l)();
    f = G(
      ie(f) ? f : [f],
      (r) => c[r] || r
    );
    let n = Nl();
    s(i, t, () => {
      i[$r].add(n);
      let r = Er(se);
      r[Ze] = Sn(he(f, we), "." + n), e[lt](r, i), Le(i, We, r);
    }), a(i, t, n);
  }
}, Sn = (e, t) => {
  e = J(e, /\/\*[\s\S]*?\*\//g, ""), e = Or(e);
  let l = [], i = Nl();
  for (; Oe(e, yl); ) {
    let n = xi(e, yl);
    n && (v(l, n[0]), e = J(e, yl, i));
  }
  let s = pt(B(e, "}"), j), a = we + "    ", f = he(G(s, (n) => {
    let [r, E] = B(n, "{"), o = G(
      G(B(r, ","), j),
      (T) => U(T, "&") ? J(T, /&/g, t) : t + " " + T
    );
    return E = he(G(pt(B(E || "", we), j), j), a), he(o, ",") + ` {${a + E + we}}`;
  }), we);
  return d(l, (n) => {
    f = J(f, i, n);
  }), f;
}, On = [m + se, Rn], _n = (e, t, l) => {
  let i, s;
  try {
    i = K(l), Rt(i) && (l = xl(l, "", ye));
  } catch {
  }
  e[rt](e, t, l, (a) => (c) => {
    try {
      let f = c();
      ie(f) ? [i, s] = f : i = K(f);
    } catch {
    }
    U([De, We, Dr, yi], s) || (s = We), Rt(i) ? Le(i, s, ...e.nodes || [a]) : vi(zs, tt, Kt, t + `="${l}"`);
  });
}, In = [m + zs, _n], Nn = (e, t, l) => {
  let i = e.el, s = ii(i);
  e.ph = kf(t), Le(i, ei, e.ph), e[ft] = !0;
  let a;
  e[rt](e, t, l, () => (c) => {
    let f = c();
    Be(() => {
      if (f)
        a = ii(s), e.nodes = [a], Le(e.ph, ei, a), e[lt](a, i);
      else if (a) {
        let n = e.bnodes.get(a), r = Di(n.nodes || [a], (E) => Fe(E));
        r && Le(r, De, e.ph), e[_l](a);
      }
    });
  });
}, wn = [Ql, Nn], dn = (e, t, l) => {
  let i = or(e.el)[Gl];
  i == "none" && (i = "block"), e[rt](e, t, l, (s) => (a) => {
    let c = a();
    Fe(s) && Be(() => {
      s[se][Gl] = c ? i : "none";
    });
  });
}, Cn = [cl, dn], Ts = 1 / 0, Fl = (e) => (t, l, i) => {
  let s = t[xe][Ql] ? Ql : t[xe][cl] ? cl : "";
  if (!s)
    return F("the", l, me, xs, "accompanied by an b-if or", cl, me);
  let [a] = t.hook, [c, f] = t[Ht], n = t.exec(t, i)();
  console.log("Transition animation:", n, "attrValue:", i, "_attrName:", s), n[Me](), (e == Z || !e) && a(t.el, s, (r, E) => c(n, r, E), Ts), (e == b || !e) && a(t.el, s, (r, E) => f(n, r, E), -Ts);
}, $n = [
  [m + Ht, Fl("")],
  [m + Ht + "-" + Z, Fl(Z)],
  [m + Ht + "-" + b, Fl(b)]
], il = (e, t, l) => {
  let [i, s] = e.hook, a = Ll(t, 5), [c] = B(a, "-"), f = e[$e][t] || {}, n = e.el, r = e.exec(e, l, "$entry", !1);
  i(n, t, Il(r, f[Al] || 100));
  let E = new IntersectionObserver((o) => {
    d(o, async (T) => {
      T.isIntersecting != (c == Ps) && (await s(n, t, T), f[Ms] && E[Yl]());
    });
  }, f);
  E[ms](n), q(e, () => E[Yl]());
}, gn = [
  [Wi, il],
  [m + Wi, il],
  [Vi, il],
  [m + Vi, il]
], us = (e, t, l) => {
  let [i, s] = e.hook, a = Ll(t, 5);
  B(a, "-");
  let c = e.el, f = e[$e][t] || {}, n = f[hi] ? K(ht) : c, r = e.exec(e, l, "$size", !1);
  i(c, t, Il(r, f[Al] || 100));
  let E = new ResizeObserver((o) => {
    let T = o[0].borderBoxSize[0];
    s(c, t, [T.inlineSize, T.blockSize]);
  });
  E[ms](n, f), q(e, () => E[Yl]());
}, Pn = [
  [qi, us],
  [m + qi, us]
], ct = "keyup", Et = "keydown", ys = "outside", Dn = "window", wr = "control", ci = "meta", sl = "arrow", ps = [
  ci,
  wr,
  "shift",
  "alt",
  "fn"
], kn = {
  ctrl: wr,
  cmd: ci,
  super: ci,
  esc: "escape",
  del: z,
  up: sl + "up",
  down: sl + "down",
  left: sl + "left",
  right: sl + "right"
}, xn = (e, t, l) => {
  let [i, s] = e.hook, a = Ll(t, 5), [c, ...f] = B(a, "-"), n = e.el, r = n, E = (p) => {
    let P = e.exec(e, l, qt + Wl, !1);
    bt(P) ? P(p) : F(Zs(Wl, t, "a " + Dl, jt(P())));
  }, o = e[$e][t] || {};
  d(f, (p) => {
    o[p] = !0;
  }), Al in o && (E = Il(E, o[Al])), Ji in o && (E = Cf(E, o[Ji])), i(n, t, E), o[ys] || o[hi] ? r = dt : o[Dn] && (r = Pe);
  let T = {};
  U([Et, ct], c) && d(V(o, "keys", []), (p) => {
    T[kn[p] || p] = !0;
  });
  let O = Ut(T), R = c;
  if (U([Et, ct], c) && O) {
    let p = {};
    c = t;
    let P = Il(($) => {
      et(r, c, $);
    }, 600);
    q(e, de(r, Et, ($) => {
      let k = Ce($.key);
      p[k] || (p[k] = !0), Be(() => {
        p.meta && !U(ps, k) && zl($, p);
      });
      let X = oe(p);
      O > 1 && ct == R && p.meta && !U(ps, k) ? P(X) : Et == R && et(r, c, X);
    })), q(e, de(r, ct, ($) => {
      Et == R && zl($, p), et(r, c, oe(p)), ct == R && zl($, p);
    })), q(e, de(r, "focus", () => {
      fr(p);
    }));
  }
  q(e, de(r, c, (p) => {
    if (o[vs] && p[Xr](), o.stop && p.stopPropagation(), !(o.self && p[Je] !== p.currentTarget) && !(o[ys] && (n.contains(p[Je]) || !Mf(n)))) {
      if (U([Et, ct], R)) {
        let P = p[ds];
        if (!(Ut(T) == Ut(P) && ki(oe(T), ($) => U(P, $))))
          return;
      }
      s(n, t, p);
    }
  }, o));
}, zl = (e, t) => {
  let l = Ce(e.key);
  t[l] && el(t, l);
}, Ln = [/^(b-on-|on-)[\w-]+$/, xn], mn = (e, t, l) => {
  let i = Ll(t, 7);
  l = xl(l || of(i), "$initial"), i = Hf(i);
  let s = Y(e.el, i) || "", a = e[$e][t] || {};
  e[rt](e, t, l, (c) => (f) => {
    let n = f(s), r = a.prop || Tr(i) && i;
    n || r ? Hi(c, i, !r && n === !0 ? "" : n, r) : tl(c, i);
  });
}, Mn = [/^(b-bind-|bind-)[\w-$]+$/, mn], rl = fe(), vn = (e, t, l) => {
  let [i, s] = e.hook, a = `the ${t} ` + me, c = di + " a reactive " + g, f = ee + "ed", n = e.el, r = Re(n), E = n.type;
  if (!U([W, Tt, ee], r))
    return F(a, _s, W, `, ${Tt}, and ${ee} ${tt}s.`, n);
  let o = yr(e.exec(e, l));
  if (!o) {
    F(a, c, n);
    return;
  }
  let T = o(), O, R = () => He(r == ee ? n[$e] : k()), h = e[$e][t] || {}, p = (w) => {
    let N = w[Ee(Y(w, g)) && $ ? ot : g], M = rl.get(w) || h;
    if (ge(N) && (M.trim && (N = j(N)), !M.raw)) {
      let L = Li(N);
      (ti(L) || Ee(L) || yf(L)) && (N = L);
    }
    return N;
  }, P = (w) => r == W && U(w, E), $ = P([at, Qi]), k = () => Ot(W + `[type="${at}"][name="${n.name}"]`), X = () => P(at) && x(k()) > 1, H = () => {
    let w = [
      [W, at, [ae, Ge, nl, At]],
      [W, Qi, [ae, Ge, nl]],
      [W, ae, [ae]],
      [W, "range", [ae]],
      [W, "", [ae, Ge]],
      [Tt, "", [ae, Ge]],
      [ee, "", [ae, Ge, nl, At]]
    ];
    for (let [N, M, L] of w)
      if (r == N && (!M || E == M)) {
        Ee(T) || st(T) || U(L, jt(T)) || vi(a, c, Vr, he(L, " or "), `for ${r == W ? E + " " : ""}${N} ${tt}s,`, bs(jt(T)), n);
        break;
      }
  };
  Be(() => {
    H(), ee == r ? d(R(), (w) => rl.set(w, h)) : P(at) && rl.set(n, h);
  }, 1);
  let ne = () => {
    if (T = o(), O = p(n), U([W, Tt], r))
      if (E == at && ie(T))
        n[ot] = U(T, O);
      else if ($)
        n[ot] = T === O;
      else {
        if (n[Ol] || dt.activeElement === n && T === O) return;
        T !== O && (n[g] = T);
      }
    else r == ee && (ie(T) ? d(R(), (w) => {
      w[f] = U(T, p(w));
    }) : n[g] = T);
  };
  Be(() => q(e, Ft(ne)), 5);
  let C = {};
  i(n, t, (w) => {
    if (T = o(), r == ee && n.multiple || X()) {
      let N = [];
      d(R(), (M) => {
        r == ee && rl.set(M, h), (M[f] || M[ot]) && v(N, p(M));
      }), o(N);
    } else o($ && !n[ot] ? !1 : p(n));
  }), (P([ye, "search", "url", "tel", "email", "password"]) || r == Tt) && (C[Ur] = Lf, C[Br] = mf);
  let _ = h.lazy || $ || r == ee ? "change" : W;
  C[_] = () => s(n, t, o);
  for (let [w, N] of Ct(C))
    q(e, de(n, w, N));
}, Hn = ["b-model", vn], Un = (e) => {
  e["#"] = /\d/, e["&"] = /[\p{Letter}]/u, e["*"] = /[\p{Letter}\d]/u;
}, pl = "output", ke = "cursor", zi = "character", Ei = "quantifier", $l = "isToken", gl = "isOptional", oi = "isMultiple", Ti = "parts", Bn = (e, t, l) => {
  let i = e.el, s = e[Zl], [a, c] = e.hook;
  if (!(g in i && Hl in i))
    return F("the", t, me, _s, Tt, tt + "s and textual", W, "types (text, email, etc.).");
  let f = s[l], n = e[$e][t] || {}, r = {
    ...n,
    [Rl]: { ...e[bl], ...n[Rl] },
    mask: l,
    [g]: "",
    [ke]: i[Hl],
    [Ti]: [],
    [pl]: ""
  };
  a(i, t, () => {
    r[g] = i[g], r[g] != r[pl] && (r[Ti] = [], r[ke] = i[Hl], f && f(r), Kn(r), i[g] = r[pl], i.setSelectionRange(r[ke], r[ke]), et(i, Nt, r));
  }), Be(() => c(i, t), 7);
  let E = de(i, W, () => c(i, t), !0);
  q(e, E);
}, Fn = (e, t) => {
  let l = [], i = "\\";
  for (let s = 0; s < x(e); s++) {
    let a = e[s], c = {
      [zi]: a,
      [Ei]: 1,
      [$l]: !1,
      [gl]: !1,
      [oi]: !1
    };
    if (a != i || a == i && e[s + 1] == i) {
      if (U(oe(t), a) && (e[s - 1] != i || e[s - 2] == i)) {
        let f = xi(Te(e, s + 1), /^\d+/);
        if (f) {
          let r = f[0];
          s += x(r), c[Ei] = +r;
        }
        c[$l] = !0;
        let n = e[s + 1];
        (n == "?" || n == "+") && (c[gl] = n == "?", c[oi] = n == "+", s++);
      }
      v(l, c);
    }
  }
  return l;
}, zn = (e, t) => Di(Te(e, t + 1), (l) => !l[gl]), As = (e, t, l) => {
  let i = -1;
  if (t) {
    let s = t[zi];
    if (t[$l]) {
      let a = xi(e, l[s]);
      a && (i = a[Ye]);
    } else i = er(e, s);
  }
  return i;
}, Kn = (e) => {
  let t = e[Rl], l = e[g], i = e[ke], s = Fn(e[Nt], t), a = "", c = l, f = Te(l, i);
  for (let [n, r] of Ct(s)) {
    let E = r[zi], o = r[Ei];
    if (r[$l]) {
      if (o > 0) {
        if (!c) break;
        let T = "";
        for (; c && (o > 0 || r[oi]); ) {
          let O = r[gl] || o < 1, R = As(c, r, t), h = O && R > 0 && zn(s, +n), p = As(c, h, t);
          if (R < 0 || p >= 0 && R > p) {
            O || (c = "");
            break;
          }
          R || (T += c[0], o--), c = Te(c, 1), f == c && (i = x(a + T));
        }
        a += T, r[g] = T;
      }
    } else c && (f == c && (i = x(a)), a += E, r[g] = E, c[0] == E && (c = Te(c, 1)));
  }
  e[ke] = e[ke] == 0 ? 0 : e[ke] == x(e[g]) ? x(a) : i, e[pl] = a, e[Ti] = s;
}, Yn = (e) => {
  let t = e[g], l = V(e, "decimal", "."), i = V(e, "thousands", ","), s = V(e, "precision", 2);
  l == "," && (i = "."), i == "." && (l = ",");
  let a = B(t, l), c = a[0], f = be(c, "-");
  c = J(c, /\D/g, ""), c = c && (J(c, /^0+/, "") || "0");
  let n = x(a) > 1, r = n ? he(Te(a, 1), l) : "", E = x(c), o = f ? "-" : "";
  for (let h = 0; h < E; h++)
    h > 0 && (E - h) % 3 == 0 && (o += i), o += "#";
  let T = e[Rl];
  t = f ? "-" + c : c, s > 0 && (T[l] = df(`\\${l}`), n && (t += l + r), o += l + "#" + s), e[Nt] = o, f && (T["-"] = /-/), T["#"] = /\d/;
  let O = 0, R = "";
  for (let h of e[g])
    h == t[O] ? (R += h, O++) : R += "∅";
  e[g] = R;
}, Gn = [m + Nt, Bn], jn = (e, t, l) => {
  l = xl(l, "$controls", !1), e[rt](e, t, l, () => async (i, s) => {
    await i(s);
  });
}, Wn = ["b-effect", jn], Vn = [
  /**
   * The b-ignore directive is used to stop the hydration of the element and its children.
   */
  tn,
  /**
   * Conditional hydration
   * Notes:
   * - b-if stops the hydration flow of the element and starts a new hydration flow with a copy of the element whenever the condition evaluates to true;
   * - whenever the condition evaluates to false, the copy of the element is dehydrated and removed from the DOM and a placeholder comment node is inserted in its place;
   * - the copy of the element may contain any directive that is hydrated after b-if, all the other directive will have already been hydrated and are no longer part of the source element.
   */
  wn,
  /**
   * Context-related directives from the farthest ($props) to the closest ($each) context.
   * Notes:
   * - b-each stops the hydration flow of the element and starts a new hydration flow for each item it creates.
   */
  nn,
  an,
  on,
  sn,
  /**
   * Static template hydration
   * Notes:
   * - the inner HTML of the element is used as a template and it may include more thann one root element;
   * - the element that contains the b-template directive is removed from the DOM and its content is inserted in place;
   */
  pn,
  /**
   * Conditional display
   * Notes:
   * - the element is hydrated regardless of the condition;
   * - the b-show directive toggles the `display` of the element based on the condition.
   */
  Cn,
  /**
   * The b-teleport moves the element to a different location in the DOM.
   * Notes:
   * - b-teleport also works with the b-if and b-template directives.
   */
  In,
  /**
   * Run one or more scripts on the element
   * Notes:
   * - the b-script directive may hold one script or an array of scripts;
   * - the script(s) are executed in order and awaited;
   * - when b-script is in a script element the content of the src file or text content is added to the list of scripts to be executed;
   */
  hn,
  /**
   * Dynamic hydration of HTML or text content and styles
   * Notes:
   * - if the element has a b-html and b-text directive, the b-html directive is hydrated and the b-text directive is ignored;
   * - b-style always hydrates regardless of the b-html and b-text directives;
   */
  Tn,
  un,
  On,
  /**
   * Data binding directives
   * Used to bind data to an element's property or attribute
   * 
   * - The `b-bind-|bind-` directive is a general directive used to bind data to an element property or attribute.
   * - The `b-model` directive is used to create a two-way data binding between an input value and a reactive property.
   * - The `b-mask` directive is used to format an input value using a mask.
   */
  Mn,
  // [b-bind|bind]-[attributeName]
  Hn,
  Gn,
  // ['b-boost', hydrateBoost],
  ...$n,
  // b-transition, b-transition-play, b-transition-reverse
  ...gn,
  // [b-on|on]-enter, [b-on|on]-exit
  ...Pn,
  // [b-on|on]-resize
  Ln,
  // [b-on|on]-[eventName]
  /**
   * b-effect: used to create an effect that run when its dependencies change.
   * It is perfect for small expressions, reactive or not.
   * Example: console.log(`Hello, ${$data.name}!`)
   */
  Wn
], Jn = (e) => {
  d(Vn, (t) => v(e[Vs], t)), e.masks.money = Yn, Un(e.maskTokens);
}, hs = "currentTime", Rs = b + "d", Zn = {
  name: "Anime.js",
  // ? This validation can be improved
  validate: (e) => ["animatables", "autoplay"].every((t) => re(e, t)),
  [Z]: (e, t) => {
    e[Rs] && (e[Me](), e[b]()), e[hs] != e.duration ? e[Z]() : t();
  },
  [b]: (e, t) => {
    e[Rs] || (e[Me](), e[b]()), e[hs] != 0 ? e[Z]() : t();
  },
  onComplete: (e, t) => {
    e.complete = t;
  }
}, Kl = Wl + "Callback", bn = {
  name: "GSAP",
  // ? This validation can be improved
  validate: (e) => [Kl, "yoyo"].every((t) => t in e),
  [Z]: (e) => {
    e[Z]();
  },
  [b]: (e) => {
    e[b]();
  },
  [hl]: (e, t) => {
    e[Kl](hl, t), e[Kl]("onReverseComplete", t);
  }
}, qn = (e) => {
  let t = e.effect;
  return t ? Number(t.getTiming().duration) : 0;
}, ea = {
  name: "Web Animations API",
  validate: (e) => e instanceof Animation,
  [Z]: (e, t) => {
    e.playbackRate < 0 && (e[b](), e[Me]()), e.currentTime != qn(e) ? e[Z]() : t();
  },
  [b]: (e, t) => {
    e.currentTime == 0 ? t() : e.playbackRate > 0 && (e[b](), e[Me]()), e.currentTime != 0 ? e[Z]() : t();
  },
  onComplete: (e, t) => {
    e.onfinish = t;
  }
};
export {
  Zn as animeAnimationEngine,
  Mn as bindDirective,
  an as dataDirective,
  sn as eachDirective,
  bn as gsapAnimationEngine,
  Tn as htmlDirective,
  wn as ifDirective,
  tn as ignoreDirective,
  gn as intersectionDirectives,
  Gn as maskDirective,
  Hn as modelDirective,
  Yn as moneyMask,
  Xn as newApp,
  Ln as onDirective,
  nn as propsDirective,
  Pn as resizeDirectives,
  hn as scriptDirective,
  Jn as setAllDirectives,
  Un as setDefaultMaskTokens,
  Bi as settings,
  Qn as setup,
  Cn as showDirective,
  On as styleDirective,
  In as teleportDirective,
  pn as templateDirective,
  $n as transitionDirectives,
  on as uidDirective,
  ea as webAnimationsApiAnimationEngine
};
//# sourceMappingURL=briojs.js.map
