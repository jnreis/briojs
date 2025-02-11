let gl = "brio", Lt = "$", De = "after", ei = "animation", ti = "append", ft = "array", et = "attr", li = "Attribute", $ = "b-", xe = "before", Pl = "begin", es = "body", qt = "boolean", Ll = "both", ts = "cache", vi = "can only be used on", er = "Cannot ", qe = "checkbox", Qe = "checked", ls = "classList", di = "closest", ii = "composi", is = "Content", tt = "create", Rl = "data", ll = "debounce", tr = "detail", lr = "define", B = "delete", Le = "directive", bl = "disconnect", xl = "display", ri = "document", ir = "each", Fe = "element", Xt = "end", si = "Engine", Ci = "entries", Hl = "error", Ge = "evalEffect", gi = "event", rr = "EventListener", sr = "exit", fi = "ctxArgs", bt = "get", rs = "head", Pi = "href", at = "html", fr = "HTML", nt = "hydrate", ar = "in", nr = "index", Sl = "inner", xt = "insert", Er = "Invalid", Ml = "length", yt = "mask", ss = "method", cr = "must be", Re = `
`, we = "newValue", _t = "name", Tr = "Node", wt = "not found.", Be = null, le = "number", Ht = "object", or = "observe", Nt = "oldValue", ai = "on-", Di = ai + "enter", wi = ai + sr, $i = ai + "resize", ur = "once", yr = "onComplete", lt = "onSet", Ar = "operation", Ne = "options", Rr = "out", ni = "outer", $t = "parent", ki = "patch", il = "pause", ml = "play", fs = "post", as = "prepend", Sr = "prevent", Or = "Propert", Ei = Or + "y", re = "props", hr = "put", Li = "radio", At = "remove", Ir = "replace", ci = "requires", Ti = "reverse", He = "route", Z = "script", ns = "Sibling", Mt = "skip", X = "select", ce = "state", _r = "start", oi = "storage", be = "string", v = "style", Nr = "teleport", ie = "template", Ee = "text", bi = "throttle", ui = "tion", pr = "toString", rl = "tokens", Ct = "transition", dr = "type", Et, Ul = "update", Cr = "validate", C = "value", gr = "With", Es = "add" + rr, Fl = Lt + Rl, sl = Lt + ir, xi = Lt + re, Oe = $ + Rl, Bl = "b-if", Vt = "b-show", cs = ts + "Exp", Ts = "clone" + Tr, fl = ii + "ng", os = ii + ui + _r, us = ii + ui + Xt, ys = tt + "Element", Kl = lr + Ei, As = lr + Or + "ies", Pr = "de" + nt, Hi = B + Ei, Rs = Le + "s", Ol = "func" + ui, Ss = bt + li, J = Sl + fr, K = "in" + hr, Os = xt + "AdjacentHTML", Yl = yt + "s", Dr = yt + "Token", Gl = Dr + "s", hs = "next" + ns, Is = "of " + dr, pt = ni + fr, wr = "Own" + Ei, _s = $t + Tr, Dl = "path" + _t, Ns = Sr + "Default", $r = "proto" + dr, ps = At + li, ds = At + rr, al = Ir + gr, Mi = He + "Rule", wl = X + "ionStart", Cs = "set" + li, gs = _r + "s" + gr, Ps = oi + "Area", nl = "tar" + bt, Je = Ee + "area", Me = Ee + is, Ds = "async" + Ol, kr = bt + wr + "Descriptor", ws = kr + "s", $s = "has" + wr, Lr = (e, t, l, i) => `the ${e} ${t} ${ci} ${l}, ` + br(i), br = (e) => `but got ${e} instead.`, Q = (e, t) => e.push(t), yi = (e, t) => e.sort(t), ks = (e) => e[Ti](), he = (e, t) => e.join(t), D = (e, t) => e.forEach(t), oe = (e, t, l) => e.map(t, l), it = (e, t, l) => e.filter(t, l), Ls = (e, t, l) => e.find(t, l), Ai = (e, t, l) => e.every(t, l), bs = (e, t, l) => e.findIndex(t, l), xr = (e, t, l) => e.indexOf(t, l), Hr = (e, t) => t[1] - e[1], Rt = (e) => Array.from(e), xs = (e, t = 0) => oe(Rt({ [Ml]: e }), (l, i) => t + i), Hs = (e, t) => e[pr](t), G = (e) => e.trim(), ze = (e) => e.toLowerCase(), z = (e, t, l) => e.split(t, l), Ri = (e, t) => e.match(t), rt = (e, t, l) => e[gs](t, l), Ke = (e, t) => t.test(e), se = (e, t, l) => e[Ir](t, l), Ms = (e) => Ke(e, /^\d+$/), ms = (e) => Ke(G(e), /^((async\s+)?function\s*\([^)]*\)\s*{[^}]*}|(async\s*)?(?:\([^()]*\)|[$\w]+)\s*=>)/), Us = (e) => JSON.stringify(e), Si = (e, t) => {
  try {
    e = JSON.parse(e, t);
  } catch {
  }
  return e;
}, Fs = (e) => {
  let t = Hs(new URLSearchParams(e));
  return t ? "?" + t : "";
}, Oi = (e) => "`" + se(e, /`/g, "\\`") + "`", kt = (e) => ze(ae(Ae[$r][pr].call(e), 8, -1)), We = (e, t) => kt(e) === t, Ie = (e) => e === Be, ct = (e) => e === Et, St = (e) => We(e, Ht), ye = (e) => We(e, ft), mt = (e) => Bs(e) || Ks(e), Bs = (e) => We(e, Ol), Ks = (e) => We(e, Ds), Ye = (e) => We(e, be), Mr = (e) => We(e, le) && isFinite(e), Ys = (e) => We(e, qt), Gs = (e) => hl(e, mr), hl = (e, t) => e instanceof t, Tt = (e) => hl(e, Node), zs = (e) => hl(e, Text), gt = (e) => hl(e, HTMLElement), Pe = window, Ae = Object, Xe = Reflect, jt = location, Ut = Pe[ri], mr = RegExp, V = (e, t, l) => St(e) && t in e ? e[t] : l, Ws = (e) => {
  let t = cl();
  for (; t in e; ) t = cl(12);
  return t;
}, Pt = (e) => j(ue(e)), qs = (e, ...t) => {
  D(t, ([l, i]) => {
    l in e && (e[i] = e[l], Ft(e, l));
  });
}, ue = (e) => Ae.keys(e), Xs = (e = Be) => Ae[tt](e), Vs = (e, t = {}) => {
  const l = Xs(e);
  return Ae[As](
    l,
    Ae[ws](t)
  ), l;
}, js = (e, t, l = Ae) => l[kr](e, t), Qs = (e) => Ae.getPrototypeOf(e), ot = (e, t) => Ae[$r][$s].call(e, t), fe = (e, t, l = {}) => {
  qs(l, ["v", C], ["w", "writable"], ["e", "enumerable"], ["c", "configurable"]), Ae[Kl](e, t, l);
}, Ur = (e, t = {}) => {
  D(ue(e), (l) => {
    fe(e, l, t);
  });
}, Ft = (e, t) => delete e[t], Js = (e) => D(ue(e), (t) => {
  Ft(e, t);
}), pe = () => /* @__PURE__ */ new Map(), Zs = (e, t) => new mr(e, t), H = (e, t, l) => e.includes(t, l), hi = (e) => St(e) ? Ae[Ci](e) : e[Ci](), ae = (e, t, l) => e.slice(t, l), j = (e) => ct(e[Ml]) ? e.size : e[Ml], de = (e, t = 0) => setTimeout(e, t), El = (e, t) => {
  let l;
  return (...i) => {
    clearTimeout(l), l = de(() => e(...i), t);
  };
}, vs = (e, t) => {
  let l = 0;
  return (...i) => {
    let s = Date.now();
    if (!(s - l < t))
      return l = s, e(...i);
  };
}, ef = () => crypto.randomUUID(), cl = (e = 8) => "b" + ae(se(ef(), /-/g, ""), 0, e - 1), Fr = (e, ...t) => console[e]("Brio.js", ...t), Br = (...e) => Fr("warn", "warn:", ...e), M = (...e) => Fr(Hl, `detected an ${Hl}:`, ...e), ut = (e, t = Ut) => Rt(t.querySelectorAll(e)), F = (e, t = Ut) => Ye(e) ? ut(e, t)[0] : e, ne = (e, t, ...l) => e[t](...l), tf = (e, t, l) => {
  t == J || t == pt ? e[t] = l : e[Os](t, l);
}, lf = (e, t, l) => {
  l && ee(l) ? ne(l, xe, e) : ne(t, ti, e);
}, rf = (e) => e[Ts](!0), mi = (e) => {
  let t = ee(e);
  if (t) {
    let l = Te(t), i = xr(l, e), s = ks(ae(l, 0, i)), E = ae(l, i + 1);
    return () => {
      let a = !1;
      for (let n of E)
        if (ee(n) == t) {
          ne(n, xe, e), a = !0;
          break;
        }
      if (!a) {
        for (let n of s)
          if (ee(n) == t) {
            ne(n, De, e), a = !0;
            break;
          }
      }
      a || ne(t, ti, e);
    };
  }
}, zl = (e, t) => D(Rt(e.attributes), ({ name: l, value: i }) => t(l, i)), Tl = (e) => e[At](), ee = (e) => e[_s], sf = (e) => e[hs], Kr = (e) => G(e[Me] || ""), Te = (e) => [...e.childNodes], Y = (e, t) => e[Ss](t), Il = (e, t, l, i) => {
  i && (e[i] = l), e[Cs](t, l);
}, _l = (e, t) => e[ps](t), Ii = (e, t) => Ut[ys](e, t), ff = (e) => new DOMParser().parseFromString(e, Ee + "/" + at), _e = (e) => ze(e.tagName || ""), Se = (e, t, l, i) => (Ye(e) && (e = F(e)), e[Es](t, l, i), () => e[ds](t, l)), me = (e, t, l) => F(e).dispatchEvent(new CustomEvent(ze(se(t, /[^a-z\d]/gi, "")), {
  bubbles: !0,
  cancelable: !0,
  [tr]: l
})), Wl = async (e, t) => {
  if (await t(e))
    for (let l of Te(e))
      await Wl(l, t);
}, af = (e) => e[nl][fl] = !0, nf = (e) => {
  let t = e[nl];
  t[fl] && (t[fl] = !1, me(t, K));
}, Yr = (e) => Pe.getComputedStyle(e), Ef = (e) => {
  let t = Yr(e);
  return !(!ee(e) || t[xl] == "none" || t.visibility == "hidden" || t.opacity == "0");
}, cf = (e, t) => new URL(e, t), Qt = (e = "", t = Pi) => cf(e, jt[Pi])[t], Gr = (e) => H(["src", C, Qe, X + "ed"], e), Ui = (e, t = "") => `:not([${e}]${t})`, Tf = (e, t, l) => async (i, s, E, a) => {
  let n = s == ni ? pt : s == Sl ? J : s == Ee ? Me : s == xe ? xe + Pl : s == "first" ? De + Pl : s == "last" ? xe + Xt : s == De ? De + Xt : s, r = "$dom." + xt, f = F(E), c = F(rs), o = F(es);
  if (!f) return M(r, Fe, wt);
  (c == f || o == f) && (n = J);
  let y = F(at) == f, h = n == Me, P = h || n == J, R = n == pt, N = P ? f : ee(f);
  if (!N && !y) return M(r, $t, Fe, wt);
  i = await i, i in l && (i = l[i]());
  let p = Tt(i) ? i : ff(i), b = V(a, X);
  b && (i = F(b, p)), Tt(i) && (i = i[pt]), (R || y) && t(f, !1), P && D(Te(f), (O) => t(O));
  let m = new Set(Te(f));
  N && D(Te(N), (O) => m.add(O));
  let te = (O) => it(Te(O), (w) => !m.has(w)), x = [];
  y ? (f[J] = F(at, p)[J], x = [f, ...ut(Z, f)]) : P ? (f[h ? Me : J] = i, x = Te(f)) : R ? (f[pt] = i, x = te(N)) : (tf(f, n, i), x = te(n == xe + Pl || n == De + Xt ? N : f)), yi(x, (O, w) => {
    let g = _e(O) == v, I = _e(w) == v;
    return g && !I ? -1 : I && !g ? 1 : 0;
  }), D(x, (O) => {
    if (
      // is script element
      _e(O) == Z && // is not b-script
      Ie(Y(O, $ + Z)) && // should load: !(b-load-once attribute AND script already loaded)
      !(!Ie(Y(O, "b-load-" + ur)) && jr.has(Y(O, "src")))
    ) {
      let w = Ii(Z);
      zl(O, (g, I) => Il(w, g, I, Gr(g) && g)), w[J] = O[J], ne(O, al, w);
    }
  }), V(a, nt, !0) && D(x, (O) => e(O, f));
}, ht = (e) => async (t, l, i = {}) => {
  let s = "status", E = V(i, "parser");
  H([bt, B], e) && St(l) && (t += Fs(l), l = Et);
  try {
    let a = await fetch(t, { ...i, [ss]: e, body: l });
    if (!a.ok) {
      let r = new Error(`HTTP ${Hl}! ${s}: ${a[s]}`);
      throw r.response = a, r;
    }
    let n = await a[E || Ee]();
    if (!E)
      try {
        n = Si(n);
      } catch {
      }
    return n;
  } catch (a) {
    throw a;
  }
}, ol = {
  get: ht(bt),
  post: ht(fs),
  put: ht(hr),
  [ki]: ht(ki),
  [B]: ht(B)
}, of = (e, t, l) => [
  // Set a route
  (i, s) => {
    if (mt(s)) {
      i = Qt(i, Dl);
      let E = it(z(i, "/"), G), a = j(E) - 1, n = e;
      D(E, (r, f) => {
        r in n || (n[r] = {}), n = n[r], f == a && (n[dt] = s);
      });
    } else M(er, "set route without a", He, Ol, Re, i);
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
    if (!rt(Qt(i), jt.origin))
      return jt.href = i, Be;
    i = Qt(i, Dl);
    let s = it(z(i, "/"), G), E = e, a = {}, n = 0;
    for (let r of s) {
      if (n = 0, r in E && !rt(r, ":"))
        E = E[r], n = 1;
      else for (let f of ue(E))
        if (rt(f, ":")) {
          let [c, o] = it(z(f, ":"), G);
          if (!o || o && o in t && t[o](r)) {
            let y = a[c];
            y ? ye(y) ? Q(y, r) : a[c] = [y, r] : a[c] = r, E = E[f], n = 1;
            break;
          }
        }
      if (!n) break;
    }
    return n = n && E[dt] ? 1 : 0, n ? E[dt]({
      params: a,
      path: i,
      [At]: () => Ft(E, dt)
    }) : l(ol.get(i), ni, at), i != jt[Dl] && history.pushState(Be, "", i), !!n;
  }
], Jt = [], uf = () => {
  let e = pe(), t = (l, i) => {
    let s = Jt.find((E) => E[Cr](l));
    if (s)
      return e.has(l) || s[yr](l, () => {
        e.get(l)();
      }), e.set(l, i), s;
    M(ei, ze(si), wt, Re, l);
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
      let E = V(s, ml, () => {
      }), a = V(s, il, () => {
      });
      !e.has(l) && !i && E();
      let n = t(l, E);
      !n || i ? E() : (a(), n.play(l, E));
    },
    /**
     * Plays the animation towards the start (in reverse)
     * 
     * When used with hook, this function is usually called after the main hook function
     * 
     * This allows the animation to transition the element into view
     */
    (l, i = !0, s) => {
      let E = V(s, ml, () => {
      }), a = V(s, il, () => {
      }), n = t(l, E);
      n && i ? (a(), n[Ti](l, E)) : E();
    }
  ];
}, yf = (e) => {
  if (!e || !Ai([_t, Cr, ml, Ti, yr], (t) => t in e))
    M(Er, ei, ze(si), e ? e[_t] : "");
  else {
    let t = bs(Jt, (l) => l[_t] == e[_t]);
    t >= 0 ? Jt[t] = e : Q(Jt, e);
  }
}, Af = (e) => {
  let t = ({ prop: l }, i) => (Ue[B](t), i[Mt].add(l), e);
  return Ue.add(t), t;
}, ql = !1, Xl = [], Rf = (e) => (Xl = [], ql = !0, e({}), ql = !1, [...Xl]), Ce = (e, t) => {
  if (!Fi(e) || $e(e)) return e;
  let l = V(t, $t, Be);
  t = { [$t]: l };
  let i = {
    get(n, r) {
      return ql && (ot(n, r) || !(r in n)) && Q(Xl, [s, r]), Xe.get(n, r, s);
    },
    set(n, r, f) {
      r in n || fe(n, r, { w: !0, e: !0, c: !0 });
      let c = s[r];
      if (c === f) return !0;
      let o = Ze(s);
      Ue.has(f) && (f = f({ [ce]: s, prop: r, [we]: f, [Nt]: c }, o, f)), E.has(r) || (f = Ce(f)), $e(c) && $e(f) && (Dt.set(f, Ze(c)), Dt[B](c));
      let y = Xe.set(n, r, f, s);
      return o[lt][r] && D(o[lt][r], (h) => h({ [ce]: s, prop: r, [we]: f, [Nt]: c }, o, h)), Bi(o, s, r, f, c), y;
    },
    [Hi](n, r) {
      let f = n[r], c = Xe[Hi](n, r);
      return Bi(Ze(s), s, r, Et, f), c;
    },
    [Kl](n, r, f) {
      let c = f[C], o = s[r];
      return Ue.has(c) && (f[C] = c({ [ce]: s, prop: r, [we]: c, [Nt]: o }, Ze(s), c)), !E.has(r) && C in f && (f[C] = Ce(f[C])), Xe[Kl](n, r, f);
    }
  };
  const s = new Proxy($e(l) ? Vs(l, e) : e, i), E = /* @__PURE__ */ new Set();
  let a = {
    [ce]: pe(),
    [re]: {},
    skip: E,
    [lt]: {}
  };
  Dt.set(s, a);
  for (let n in e) {
    let r = e[n];
    Ue.has(r) ? (r = r({ [ce]: s, prop: n, [we]: r, [Nt]: Et }, a, r), Xe.set(e, n, r, s)) : !E.has(n) && Fi(r) && Xe.set(e, n, r, s);
  }
  return s;
}, Fi = (e) => ye(e) || St(e), Bi = (e, t, l, i, s) => {
  let E = ct(s) ? tt : ct(i) ? B : Ul, a = {
    [Ar]: E,
    [ce]: t,
    prop: l,
    [we]: i,
    [Nt]: s
  };
  Ki(e[ce], a), e[re][l] && Ki(e[re][l], a);
}, Ki = async (e, t) => {
  let l = Rt(e);
  yi(l, Hr);
  for (let [i] of l) await i(t);
}, Sf = (e, t, l) => {
  e[lt][t] || (e[lt][t] = /* @__PURE__ */ new Set()), e[lt][t].add(l);
}, zr = "getItem", Wr = "setItem", Vl = pe(), Of = (e) => {
  let t = Qs(e);
  return t && ot(t, zr) && ot(t, Wr);
}, jl = (e, t) => Si(e[zr](t) || ""), Yi = (e, t, l) => e[Wr](t, Us(l)), Gi = (e) => "_b_" + e, qr = (e, t, l) => {
  if (!Of(e))
    return M(Er, oi, Ht);
  l && (l = Gi(l), ot(e, l) && (t = jl(e, l)));
  let i = ({ state: s, prop: E }, a) => {
    Ue[B](i), Vl.set(l, [s, E, e]), l = l || Gi(E), ot(e, l) ? t = jl(e, l) : Yi(e, l, t);
    let n = () => Yi(e, l, s[E]);
    return de(() => st(s, E, n)), Sf(a, E, ({ state: r, prop: f }) => {
      $e(r[f]) && st(r[f], "", n);
    }), t;
  };
  return Ue.add(i), i;
}, hf = (e) => {
  if (Vl.has(e.key)) {
    let [t, l, i] = Vl.get(e.key);
    i === e[Ps] && (t[l] = jl(i, e.key));
  }
}, Zt = (e, t, l = 0) => {
  let i = [], s = Rf(t || e);
  return D(s, ([E, a]) => {
    Q(i, Vr(E, a, e, l));
  }), t && e({}), () => D(i, (E) => E());
}, st = (e, t, l, i = 0) => (
  // If the proxied object is not an observed state, log an error and return an empty function
  !$e(e) && !M(er + `watch non-${ce} ${Ht}/${ft}.`) ? () => {
  } : ot(e, t) ? Vr(e, t, l, i) : Xr(e, l, i)
), Dt = pe(), Ue = /* @__PURE__ */ new Set(), $e = (e) => Dt.has(e), Ze = (e) => Dt.get(e), Xr = (e, t, l = 0) => {
  if ($e(e)) {
    let i = Ze(e)[ce];
    return i.set(t, l), () => i[B](t);
  }
}, Vr = (e, t, l, i = 0) => {
  let s = Ze(e)[re];
  s[t] || (s[t] = pe()), s[t].set(l, i);
  let E = Xr(e[t], l, i);
  return () => {
    s[t][B](l), E && E();
  };
};
fe(Ce, "persist", { v: (e, t) => qr(localStorage, e, t) });
fe(Ce, "session", { v: (e, t) => qr(sessionStorage, e, t) });
fe(Ce, Mt, { v: Af });
let ul = (e, t, l = !0) => new Function(e, l ? `return(${t})` : t), If = (e, t) => t ? Oi(e) : ve(e), Nl = (e, t = "", l = !0) => (ms(e) || (e = If(e, l == Ee), e = `(${t})=>` + (l ? `(${e})` : `{${e}}`)), e), zi = (e, t, l) => {
  let i = e.get(t);
  return i && i[l];
}, _f = (e) => [
  // Adds a hook to a target
  (t, l, i, s = 0) => {
    mt(i) && (e.has(t) || e.set(t, {}), e.get(t)[l] || (e.get(t)[l] = pe()), zi(e, t, l).set(i, s));
  },
  // Calls all the functions under a hook name on a target by priority
  async (t, l, i) => {
    let s = zi(e, t, l);
    if (s && j(s)) {
      let E = Rt(s);
      yi(E, Hr);
      let a = -1, n = !0, r = async () => {
        if (a++, n = !0, a < j(E)) {
          let f = a;
          await E[f][0](
            /** Contextual data, if any */
            i,
            {
              /** Call the next function */
              play: r,
              /** Disable the auto-run feature and choose when/if to call the next function */
              [il]: () => n = !1,
              /** Remove the current function */
              [At]: () => s[B](E[f][0])
            }
          ), n && await r();
        }
      };
      await r();
    }
  }
], dt = Symbol(), _i = {}, jr = /* @__PURE__ */ new Set(), ca = () => {
  let e = (T) => h.get(T), t = (T, A = () => !0) => {
    let u = T ? ee(T) : Be;
    for (; u; ) {
      let S = e(u);
      if (S && Pt(S[et]) && A(S)) return S;
      u = ee(u);
    }
  }, l = (T, A) => {
    let u = e(T);
    if (!u) {
      let S = A ? e(A) : t(A || T);
      u = {
        // Local context
        // @ts-ignore
        ctx: { ...Bt },
        // A reference to the element. Convenience for internal use.
        el: T,
        // UID context
        uid: V(S, "uid", {}),
        /** Attributes or directives */
        attr: {},
        /** Cleanup functions */
        cFns: [],
        ...dl,
        ...Ot
      };
      for (let d in x) {
        let k = x[d](u, S);
        k && fe(u.ctx, d, { v: k, e: !0 });
      }
      h.set(T, u);
    }
    return u;
  }, i = (T, A, u, S) => {
    let d = T.el;
    O(d, A, S(d));
    let k = y(T, u);
    W(T, Zt(() => w(d, A, k)));
  }, s = (T, A) => {
    Ye(T) && (T = F(T)), Ye(A) && (A = F(A)), Tt(A) || (A = Et), Tt(T) && (f(T), Wl(T, async (u) => {
      let S = !1, d = T == u ? A : Et;
      if (zs(u) && Kr(u))
        S = a(u, d);
      else if (gt(u))
        if (_e(u) == ie) {
          let L = Ii("div");
          zl(u, (ge, Kt) => Il(L, ge, Kt)), L[J] = u[J], ne(u, al, L), s(L, d), de(() => ne(L, al, ...Te(L)));
        } else
          S = await n(u, d);
      return S;
    }));
  }, E = (T, A = !0, u = !0) => {
    Wl(T, (S) => {
      let d = e(S);
      return d && (D(d.cFns, (k) => k()), u && h[B](S), A && Tl(S)), !0;
    });
  }, a = (T, A) => {
    let u = T[Me], S = Qr(ve(u || ""));
    if (S && Ke(S, el)) {
      let d = l(T, A), k = y(d, `$el.${Me}=${Oi(S)}`, "", !1);
      W(d, Zt(k)), vt(d, Ee, u);
    }
    return !1;
  }, n = async (T, A) => {
    let u = l(T, A);
    if (!ct(It(u))) return !0;
    u[Ne] = r(u, $ + Ne)();
    for (let [S, d] of R) {
      let k = [];
      if (Gs(S))
        zl(T, (L, ge) => {
          Ke(L, S) && Q(k, [L, ge]);
        });
      else {
        let L = Y(T, S);
        Ie(L) || Q(k, [S, L]);
      }
      for (let [L, ge] of k) {
        if (It(u)) break;
        vt(u, L, ge), await d(u, L, ve(ge));
      }
      if (It(u)) break;
    }
    return ct(It(u)) && (u.skip = !1), !Pt(u[et]) && !A && h[B](T), !It(u);
  }, r = (T, A, u = "{}") => {
    let S = ve(Y(T.el, A) || u);
    return vt(T, A, S), y(T, S);
  }, f = (T) => {
    let A = $ + "save";
    if (gt(T)) {
      let u = ut(ie + `,[${A}]`, T);
      (Y(T, A) || _e(T) == ie) && Q(u, T), D(u, (S) => {
        let d = Y(S, A);
        _l(S, A);
        let k = _e(S);
        if (k == ie && D(Te(S.content), (L) => f(L)), d) {
          let L = k == Z, ge = L ? Z : k == v ? v : ie, Kt = S[J];
          Ot[ge][d] = L ? ul(Cl, ve(Kt), !1) : Kt, Ie(Y(S, $ + nt)) && Tl(S);
        }
      });
    }
  }, c = (T) => (A, u) => {
    Ot[T][A] = u;
  }, o = (T, A = "", u = !0) => {
    let S;
    return T = Nl(T, A, u), T in te ? S = te[T] : (S = Ws(m), m[S] = ul(Cl, T), te[T] = S), S;
  }, y = (T, A, u = "", S = !0) => {
    let d;
    try {
      let k = A in m ? A : o(A, u, S);
      d = m[k](T.ctx);
    } catch (k) {
      M(k.message), d = () => dt;
    }
    return d;
  }, h = pe(), P = pe(), R = [], N = {}, p = {}, b = { [le]: Ms }, m = {}, te = {}, x = {
    // The element itself
    $el: (T) => T.el,
    // References to `b-ref` elements under the same $data context, not including nested $data contexts
    $refs: (T, A) => !A || gt(T.el) && !Ie(Y(T.el, Oe)) ? {} : A.ctx.$refs,
    // Unique identifier for the element
    $uid: (T) => (A) => `${A}-${T.uid[A]}`,
    // Reactive properties defined in the element or inherited from the parent context
    [xi]: Wi(xi, $ + re, !0),
    // The $data context
    [Fl]: Wi(Fl, Oe),
    // The $each context
    [sl]: (T, A) => A == null ? void 0 : A.ctx[sl]
  }, [O, w] = _f(P), g = Tf(s, E, N), [I, _] = of(p, b, g);
  _i[He] || qi(_);
  let U = ei + si, q = {
    hook: O,
    [He]: I,
    router: qi,
    [Mi]: c(Mi + "s"),
    [ie]: c(ie),
    [v]: c(v),
    [Z]: c(Z),
    [re]: c(re),
    data: c(Rl),
    mask: c(Yl),
    [Dr]: c(Gl),
    [U]: yf
  }, dl = {
    [nt]: s,
    [Pr]: E,
    [xt]: g,
    [He]: _,
    emit: me,
    listen: Se,
    query: F,
    queryAll: ut,
    /** Get the closest parent element of a target element that has a directive (b-data by default) */
    [di](T, A = Oe) {
      let u = t(F(T), (S) => A in S[et]);
      return u || M(di + ":", Fe, wt), u == null ? void 0 : u.el;
    },
    /** Get the local context of an element */
    context: (T) => {
      var A;
      return (A = e(F(T))) == null ? void 0 : A.ctx;
    }
  }, Bt = {
    $dom: dl,
    $http: ol,
    $set: q,
    $store: Ce({}),
    $state: Ce,
    $watch: st,
    $effect: Zt
  }, Cl, pi = () => Cl = `{${he(ue(Bt))},${he(ue(x))}}`;
  pi();
  let Ot = {
    [ie]: N,
    [v]: {},
    [Z]: {},
    [re]: {},
    data: {},
    // ! HYDRATION
    lcFns: x,
    [Rs]: R,
    vnodes: h,
    hooks: P,
    [Yl]: {},
    [Gl]: {},
    routes: p,
    routeRules: b,
    // ! PUBLIC CONTEXT
    gc: Bt,
    // ! TOOLS
    exec: y,
    [cs]: o,
    [fi]: pi,
    [Ge]: i,
    vnode: [l, e],
    hook: [O, w],
    [Ct]: uf()
    // insert,
    // route: [SetRoute, Route],
  };
  return D([q, dl, ol, Bt, Ot], (T) => Ur(T, { w: !1, c: !1 })), Ot;
}, It = (e) => e.skip, W = (e, t) => {
  Q(e.cFns, t);
}, vt = (e, t, l) => {
  e[et][t] = l, gt(e.el) && _l(e.el, t);
}, ve = (e) => se(G(he(oe(z(e, Re), (t) => rt(G(t), "//") ? "" : t), Re)), /;$/, ""), el = /\${((?!.*\${).*?)}/, Qr = (e) => {
  let t = /{{((?!.*{{).*?)}}/;
  for (; Ke(e, t); )
    e = se(e, t, "${$1}");
  return e;
}, Wi = (e, t, l) => (i, s) => {
  let E = i.el, a = s ? s.ctx[e] : Be, n = gt(E), r = n && !Ie(Y(E, t)), f = n && (!a || r);
  return f && !r && t == Oe && Il(E, Oe, ""), f ? Ce({}, { [$t]: l && a }) : a || {};
}, qi = (e) => {
  mt(e) && (_i[He] = () => e(Qt()));
}, Ta = (e = {}) => {
  gl in Pe || (Ur(e, { w: !1, c: !1 }), fe(Pe, gl, { v: e }), Se(Pe, oi, hf), Se(Pe, "pop" + ce, _i[He]), me(Pe, gl));
}, pl = (e, t) => ae(e, rt(e, $) ? t : t - 2), Nf = async (e, t, l) => {
  e[Mt] = !l || !!await e.exec(e, l)();
}, pf = ["b-ignore", Nf], df = (e, t, l) => {
  let i = e.el, [s, E] = e.vnode, [a, n] = e.hook;
  e[Mt] = !0;
  let [r, f] = oe(z(l, " in "), G), [c, o] = oe(z(r, ","), G);
  o || (o = nr);
  let y = `the ${t} ${Le} ` + ci;
  if (!Xi(c) || !Xi(o))
    return M(y, "a valid alias.");
  let h = e.exec(e, f)(), P = $e(h);
  if (Mr(h) && (h = xs(h, 1)), !(ye(h) || St(h)))
    return M(y, `an ${ft}, ${Ht}, or ${le}.`);
  let R = sf(i), N = ee(i);
  Tl(i);
  let p = {}, b = t + "-" + tt, m = t + "-" + Ul, te = t + "-" + B;
  a(i, b, ([O, w]) => {
    let g = rf(i);
    lf(g, N, R);
    let I = s(g);
    vt(I, "", "");
    let _ = Ce({});
    fe(_, c, { v: w, w: !0, e: !0 }), fe(_, o, { v: O, w: !0, e: !0 }), fe(I.ctx, sl, { v: _, e: !0 }), W(I, st(_, o, ({ [we]: U }) => {
      let q = p[O][1];
      U !== q && (_[o] = q);
    })), P && W(I, st(_, c, ({ [we]: U }) => {
      h[_[o]] = U;
    })), p[O] = [g, O], e[nt](g);
  }), a(i, m, ([O, w]) => {
    let g = p[O], I = E(g && g[0]);
    if (I) {
      let _ = I.ctx[sl];
      _[c] = w, _[o] = O, g[1] = O;
    }
  }), a(i, te, ([O, w]) => {
    let [g] = p[O];
    e[Pr](g), Ft(p, O);
  });
  let x = {
    [tt]: (O) => n(i, b, O),
    [Ul]: (O) => n(i, m, O),
    [B]: (O) => n(i, te, O)
  };
  for (let O of hi(h))
    x[tt](O);
  P && W(e, st(h, "", ({ [Ar]: O, prop: w, [we]: g }) => {
    x[O]([w, g]);
  }));
}, Xi = (e) => Ke(e, /^[a-z_$][\w$]*$/i), Cf = [$ + ir, df], gf = async (e, t) => {
  let [l, i] = e.hook, s = e.el;
  l(s, t, () => {
    let E = e.ctx.$refs, a = ` [${t}]`, n = ut(a + Ui(Oe) + Ui(Oe, a), s);
    D([s, ...n], (r) => {
      let f = Y(r, t);
      if (f) {
        let c = E[f];
        c ? ye(c) ? Q(c, r) : E[f] = [c, r] : E[f] = r, _l(r, t);
      }
    });
  }), await i(s, t);
}, Jr = async (e, t, l) => {
  let [i, s] = e.hook, E = t == Oe, a = E ? Rl : re, n = e[a], r = l ? n[l] || ul(e[fi](), l) : () => ({}), f = e.ctx[Lt + a];
  i(e.el, t, async () => {
    let c = await r(e.ctx);
    if (!St(c))
      return e[Mt] = !0, M(Lr(Le, t, "an " + Ht, kt(c)));
    for (let o in c) fe(f, o, js(c, o));
    E && await gf(e, "b-ref");
  }), await s(e.el, t, f);
}, Pf = [$ + re, Jr], Df = [Oe, Jr], Yt = {}, wf = async (e, t, l) => {
  if (l) {
    let i = e.el, [s, E] = e.hook;
    s(i, t, () => {
      let a = e.exec(e, l)();
      if (!ye(a) || !Ai(a, Ye))
        return M("the", t, Le, cr, `an ${ft} of ${be}(s).`);
      e.uid = a.reduce((n, r) => (r in Yt ? Yt[r]++ : Yt[r] = 1, n[r] = Yt[r], n), {});
    }), await E(i, t);
  }
}, $f = ["b-uid", wf], Zr = (e) => (t, l, i) => {
  let s = t[ie];
  i in s && (i = Oi(s[i] || i)), i && t[Ge](t, l, i, (E) => async (a) => {
    await t[xt](a(), e, E);
  });
}, kf = [$ + at, Zr(Sl)], Lf = [$ + Ee, Zr(Ee)], bf = (e, t, l) => {
  let i = e.el, s = e[ie][l] || e.exec(e, l)(), [E, a] = e.hook;
  E(i, t, async () => {
    await e[xt](s, Sl, i), ne(i, al, ...Te(i));
  }), a(i, t);
}, xf = [$ + ie, bf], Hf = async (e, t, l) => {
  let i = e.el, s = e[Z], E = _e(i) == Z;
  e.skip = E;
  let [a, n] = e.hook, r = l ? s[l] || e.exec(e, l)() : [];
  r = oe(
    ye(r) ? r : [r],
    (f) => s[f] || f
  ), a(i, t, async () => {
    if (E) {
      let f = Y(i, "src");
      f && jr.add(f);
      let c = f ? await ol.get(f) : Kr(i);
      c && Q(r, ve(c)), Tl(i);
    }
    for (let f of r) {
      let c = f;
      Ye(c) && (c = ul(e[fi](), c, !1)), mt(c) && await c(e.ctx);
    }
  }), await n(i, t);
}, Mf = [$ + Z, Hf], mf = (e, t, l) => {
  let i = e.el;
  if (l && _e(i) != v) {
    let [s, E] = e.hook, a = e[v], n = a[l] || e.exec(e, l)();
    n = oe(
      ye(n) ? n : [n],
      (f) => a[f] || f
    );
    let r = cl();
    s(i, t, () => {
      i[ls].add(r);
      let f = Ii(v);
      f[Me] = Uf(he(n, Re), "." + r), e[nt](f, i), ne(i, De, f);
    }), E(i, t, r);
  }
}, Uf = (e, t) => {
  e = se(e, /\/\*[\s\S]*?\*\//g, ""), e = Qr(e);
  let l = [], i = cl();
  for (; Ke(e, el); ) {
    let r = Ri(e, el);
    r && (Q(l, r[0]), e = se(e, el, i));
  }
  let s = it(z(e, "}"), G), E = Re + "    ", n = he(oe(s, (r) => {
    let [f, c] = z(r, "{"), o = oe(
      oe(z(f, ","), G),
      (y) => H(y, "&") ? se(y, /&/g, t) : t + " " + y
    );
    return c = he(oe(it(z(c || "", Re), G), G), E), he(o, ",") + ` {${E + c + Re}}`;
  }), Re);
  return D(l, (r) => {
    n = se(n, i, r);
  }), n;
}, Ff = [$ + v, mf], Bf = (e, t, l) => {
  let i, s;
  try {
    i = F(l), Tt(i) && (l = Nl(l, "", Ee));
  } catch {
  }
  e[Ge](e, t, l, (E) => (a) => {
    try {
      let n = a();
      ye(n) ? [i, s] = n : i = F(n);
    } catch {
    }
    H([xe, De, as, ti], s) || (s = De), Tt(i) ? ne(i, s, E) : Br(Nr, Fe, wt, t + `="${l}"`);
  });
}, Kf = [$ + Nr, Bf], Yf = (e, t, l) => {
  e[Ge](e, t, l, (i) => {
    let s = ee(i), E = mi(i);
    return (a) => {
      let n = a();
      de(() => {
        if (n) E();
        else {
          let r = ee(i);
          r && (r != s && (s = r, E = mi(i)), i[At]());
        }
      });
    };
  });
}, Gf = [Bl, Yf], zf = (e, t, l) => {
  let i = Yr(e.el)[xl];
  i == "none" && (i = "block"), e[Ge](e, t, l, (s) => (E) => {
    let a = E();
    ee(s) && de(() => {
      s[v][xl] = a ? i : "none";
    });
  });
}, Wf = [Vt, zf], Vi = 1 / 0, $l = (e) => (t, l, i) => {
  let s = t[et][Bl] ? Bl : t[et][Vt] ? Vt : "";
  if (!s)
    return M("the", l, Le, cr, "accompanied by an b-if or", Vt, Le);
  let [E] = t.hook, [a, n] = t[Ct], r = t.exec(t, i)();
  r[il](), (e == Rr || e == Ll) && E(t.el, s, (f, c) => a(r, f, c), Vi), (e == ar || e == Ll) && E(t.el, s, (f, c) => n(r, f, c), -Vi);
}, qf = [
  [$ + Ct, $l(Ll)],
  [$ + Ct + "-in", $l(ar)],
  [$ + Ct + "-out", $l(Rr)]
], Gt = (e, t, l) => {
  let [i, s] = e.hook, E = pl(t, 5), [a] = z(E, "-"), n = e[Ne][t] || {}, r = e.el, f = e.exec(e, l, "$entry", !1);
  i(r, t, El(f, n[ll] || 100));
  let c = new IntersectionObserver((o) => {
    D(o, async (y) => {
      y.isIntersecting != (a == sr) && (await s(r, t, y), n[ur] && c[bl]());
    });
  }, n);
  c[or](r), W(e, () => c[bl]());
}, Xf = [
  [Di, Gt],
  [$ + Di, Gt],
  [wi, Gt],
  [$ + wi, Gt]
], ji = (e, t, l) => {
  let [i, s] = e.hook, E = pl(t, 5);
  z(E, "-");
  let a = e.el, n = e[Ne][t] || {}, r = n[ri] ? F(at) : a, f = e.exec(e, l, "$size", !1);
  i(a, t, El(f, n[ll] || 100));
  let c = new ResizeObserver((o) => {
    let y = o[0].borderBoxSize[0];
    s(a, t, [y.inlineSize, y.blockSize]);
  });
  c[or](r, n), W(e, () => c[bl]());
}, Vf = [
  [$i, ji],
  [$ + $i, ji]
], Ve = "keyup", je = "keydown", Qi = "outside", jf = "window", vr = "control", Ql = "meta", zt = "arrow", Ji = [
  Ql,
  vr,
  "shift",
  "alt",
  "fn"
], Qf = {
  ctrl: vr,
  cmd: Ql,
  super: Ql,
  esc: "escape",
  del: B,
  up: zt + "up",
  down: zt + "down",
  left: zt + "left",
  right: zt + "right"
}, Jf = (e, t, l) => {
  let [i, s] = e.hook, E = pl(t, 5), [a] = z(E, "-"), n = e.el, r = n, f = (R) => {
    let N = e.exec(e, l, Lt + gi, !1);
    mt(N) ? N(R) : M(Lr(gi, t, "a " + Ol, kt(N())));
  }, c = e[Ne][t] || {};
  ll in c && (f = El(f, c[ll])), bi in c && (f = vs(f, c[bi])), i(n, t, f), c[Qi] || c[ri] ? r = Ut : c[jf] && (r = Pe);
  let o = {};
  H([je, Ve], a) && D(V(c, "keys", []), (R) => {
    o[Qf[R] || R] = !0;
  });
  let y = Pt(o), h = a;
  if (H([je, Ve], a) && y) {
    let R = {};
    a = t;
    let N = El((p) => {
      me(r, a, p);
    }, 600);
    W(e, Se(r, je, (p) => {
      let b = ze(p.key);
      R[b] || (R[b] = !0), de(() => {
        R.meta && !H(Ji, b) && kl(p, R);
      });
      let m = ue(R);
      y > 1 && Ve == h && R.meta && !H(Ji, b) ? N(m) : je == h && me(r, a, m);
    })), W(e, Se(r, Ve, (p) => {
      je == h && kl(p, R), me(r, a, ue(R)), Ve == h && kl(p, R);
    })), W(e, Se(r, "focus", () => {
      Js(R);
    }));
  }
  W(e, Se(r, a, (R) => {
    if (c[Sr] && R[Ns](), c.stop && R.stopPropagation(), !(c.self && R[nl] !== R.currentTarget) && !(c[Qi] && (n.contains(R[nl]) || !Ef(n)))) {
      if (H([je, Ve], h)) {
        let N = R[tr];
        if (!(Pt(o) == Pt(N) && Ai(ue(o), (p) => H(N, p))))
          return;
      }
      s(n, t, R);
    }
  }, c));
}, kl = (e, t) => {
  let l = ze(e.key);
  t[l] && Ft(t, l);
}, Zf = [/^(b-on-|on-)[\w-]+$/, Jf], vf = (e, t, l) => {
  let i = pl(t, 7);
  l = Nl(l || Fl + `['${i}']`, "$initial");
  let s = Y(e.el, i) || "", E = e[Ne][t] || {};
  e[Ge](e, t, l, (a) => (n) => {
    let r = n(s), f = E.prop || Gr(i) && i;
    r || f ? Il(a, i, !f && r === !0 ? "" : r, f) : _l(a, i);
  });
}, ea = [/^(b-bind-|bind-)[\w-]+$/, vf], Wt = pe(), ta = (e, t, l) => {
  let [i, s] = e.hook, E = `the ${t} ` + Le, a = ci + " a reactive " + C, n = X + "ed", r = e.el, f = _e(r), c = r.type;
  if (!H([K, Je, X], f))
    return M(E, vi, K, `, ${Je}, and ${X} ${Fe}s.`, r);
  let o = e.exec(e, l), y = o(), h, P = () => Rt(f == X ? r[Ne] : m()), R = e[Ne][t] || {}, N = (I) => {
    let _ = I[Ie(Y(I, C)) && b ? Qe : C], U = Wt.get(I) || R;
    if (Ye(_) && (U.trim && (_ = G(_)), !U.raw)) {
      let q = Si(_);
      (Mr(q) || Ie(q) || Ys(q)) && (_ = q);
    }
    return _;
  }, p = (I) => f == K && H(I, c), b = p([qe, Li]), m = () => ut(K + `[type="${qe}"][name="${r.name}"]`), te = () => p(qe) && j(m()) > 1, x = () => {
    let I = [
      [K, qe, [le, be, qt, ft]],
      [K, Li, [le, be, qt]],
      [K, le, [le]],
      [K, "range", [le]],
      [K, "", [le, be]],
      [Je, "", [le, be]],
      [X, "", [le, be, qt, ft]]
    ];
    for (let [_, U, q] of I)
      if (f == _ && (!U || c == U)) {
        Ie(y) || ct(y) || H(q, kt(y)) || Br(E, a, Is, he(q, " or "), `for ${f == K ? c + " " : ""}${_} ${Fe}s,`, br(kt(y)), r);
        break;
      }
  };
  de(() => {
    x(), X == f ? D(P(), (I) => Wt.set(I, R)) : p(qe) && Wt.set(r, R);
  }, 1);
  let O = () => {
    if (y = o(), h = N(r), H([K, Je], f))
      if (c == qe && ye(y))
        r[Qe] = H(y, h);
      else if (b)
        r[Qe] = y === h;
      else {
        if (r[fl] || Ut.activeElement === r && y === h) return;
        y !== h && (r[C] = y);
      }
    else f == X && (ye(y) ? D(P(), (I) => {
      I[n] = H(y, N(I));
    }) : r[C] = y);
  };
  de(() => W(e, Zt(O)), 5);
  let w = {};
  i(r, t, (I) => {
    if (y = o(), f == X && r.multiple || te()) {
      let _ = [];
      D(P(), (U) => {
        f == X && Wt.set(U, R), (U[n] || U[Qe]) && Q(_, N(U));
      }), o(_);
    } else o(b && !r[Qe] ? !1 : N(r));
  }), (p([Ee, "search", "url", "tel", "email", "password"]) || f == Je) && (w[os] = af, w[us] = nf);
  let g = R.lazy || b || f == X ? "change" : K;
  w[g] = () => s(r, t, o);
  for (let [I, _] of hi(w))
    W(e, Se(r, I, _));
}, la = ["b-model", ta], oa = (e) => {
  e["#"] = /\d/, e["&"] = /[\p{Letter}]/u, e["*"] = /[\p{Letter}\d]/u;
}, tl = "output", ke = "cursor", Ni = "character", Jl = "quantifier", yl = "isToken", Al = "isOptional", Zl = "isMultiple", vl = "parts", ia = (e, t, l) => {
  let i = e.el, s = e[Yl], [E, a] = e.hook;
  if (!(C in i && wl in i))
    return M("the", t, Le, vi, Je, Fe + "s and textual", K, "types (text, email, etc.).");
  let n = s[l], r = e[Ne][t] || {}, f = {
    ...r,
    [rl]: { ...e[Gl], ...r[rl] },
    mask: l,
    [C]: "",
    [ke]: i[wl],
    [vl]: [],
    [tl]: ""
  };
  E(i, t, () => {
    f[C] = i[C], f[C] != f[tl] && (f[vl] = [], f[ke] = i[wl], n && n(f), fa(f), i[C] = f[tl], i.setSelectionRange(f[ke], f[ke]), me(i, yt, f));
  }), de(() => a(i, t), 7);
  let c = Se(i, K, () => a(i, t), !0);
  W(e, c);
}, ra = (e, t) => {
  let l = [], i = "\\";
  for (let s = 0; s < j(e); s++) {
    let E = e[s], a = {
      [Ni]: E,
      [Jl]: 1,
      [yl]: !1,
      [Al]: !1,
      [Zl]: !1
    };
    if (E != i || E == i && e[s + 1] == i) {
      if (H(ue(t), E) && (e[s - 1] != i || e[s - 2] == i)) {
        let n = Ri(ae(e, s + 1), /^\d+/);
        if (n) {
          let f = n[0];
          s += j(f), a[Jl] = +f;
        }
        a[yl] = !0;
        let r = e[s + 1];
        (r == "?" || r == "+") && (a[Al] = r == "?", a[Zl] = r == "+", s++);
      }
      Q(l, a);
    }
  }
  return l;
}, sa = (e, t) => Ls(ae(e, t + 1), (l) => !l[Al]), Zi = (e, t, l) => {
  let i = -1;
  if (t) {
    let s = t[Ni];
    if (t[yl]) {
      let E = Ri(e, l[s]);
      E && (i = E[nr]);
    } else i = xr(e, s);
  }
  return i;
}, fa = (e) => {
  let t = e[rl], l = e[C], i = e[ke], s = ra(e[yt], t), E = "", a = l, n = ae(l, i);
  for (let [r, f] of hi(s)) {
    let c = f[Ni], o = f[Jl];
    if (f[yl]) {
      if (o > 0) {
        if (!a) break;
        let y = "";
        for (; a && (o > 0 || f[Zl]); ) {
          let h = f[Al] || o < 1, P = Zi(a, f, t), R = h && P > 0 && sa(s, +r), N = Zi(a, R, t);
          if (P < 0 || N >= 0 && P > N) {
            h || (a = "");
            break;
          }
          P || (y += a[0], o--), a = ae(a, 1), n == a && (i = j(E + y));
        }
        E += y, f[C] = y;
      }
    } else a && (n == a && (i = j(E)), E += c, f[C] = c, a[0] == c && (a = ae(a, 1)));
  }
  e[ke] = e[ke] == 0 ? 0 : e[ke] == j(e[C]) ? j(E) : i, e[tl] = E, e[vl] = s;
}, ua = (e) => {
  let t = e[C], l = V(e, "decimal", "."), i = V(e, "thousands", ","), s = V(e, "precision", 2);
  l == "," && (i = "."), i == "." && (l = ",");
  let E = z(t, l), a = E[0], n = rt(a, "-");
  a = se(a, /\D/g, ""), a = a && (se(a, /^0+/, "") || "0");
  let r = j(E) > 1, f = r ? he(ae(E, 1), l) : "", c = j(a), o = n ? "-" : "";
  for (let R = 0; R < c; R++)
    R > 0 && (c - R) % 3 == 0 && (o += i), o += "#";
  let y = e[rl];
  t = n ? "-" + a : a, s > 0 && (y[l] = Zs(`\\${l}`), r && (t += l + f), o += l + "#" + s), e[yt] = o, n && (y["-"] = /-/), y["#"] = /\d/;
  let h = 0, P = "";
  for (let R of e[C])
    R == t[h] ? (P += R, h++) : P += "∅";
  e[C] = P;
}, aa = [$ + yt, ia], na = (e, t, l) => {
  l = Nl(l, "$controls", !1), e[Ge](e, t, l, () => async (i, s) => {
    await i(s);
  });
}, Ea = ["b-effect", na], ya = [
  // IMPORTANT: The `b-ignore` directive must be hydrated first because it stops the hydration of the element and its children.
  pf,
  // IMPORTANT: The `b-each` directive must be hydrated second because it hydrates other directives for each item it iterates over.
  Cf,
  // Context-related directives
  Pf,
  Df,
  $f,
  kf,
  Lf,
  xf,
  Mf,
  Ff,
  // IMPORTANT: The `b-teleport` directive must be hydrated before the `b-if` directive because `b-if` restores the element to its original position.
  Kf,
  // Conditional directives: These directives usually depend on values from the context
  Gf,
  Wf,
  // ['b-boost', hydrateBoost],
  ...qf,
  // b-transition, b-transition-in, b-transition-out
  ...Xf,
  // [b-on|on]-enter, [b-on|on]-exit
  ...Vf,
  // [b-on|on]-resize
  Zf,
  // [b-on|on]-[eventName]
  /**
   * Data binding directives
   * Used to bind data to an element's property or attribute
   * 
   * - The `b-bind-|bind-` directive is a general directive used to bind data to an element property or attribute.
   * - The `b-model` directive is used to create a two-way data binding between an input value and a reactive property.
   * - The `b-mask` directive is used to format an input value using a mask.
   */
  ea,
  // [b-bind|bind]-[attributeName]
  la,
  aa,
  /**
   * b-effect: used to create an effect that run when its dependencies change.
   * It is perfect for small expressions, reactive or not.
   * Example: console.log(`Hello, ${$data.name}!`)
   */
  Ea
];
export {
  ya as allDirectives,
  ea as bindDirective,
  Df as dataDirective,
  Cf as eachDirective,
  kf as htmlDirective,
  Gf as ifDirective,
  pf as ignoreDirective,
  Xf as intersectionDirectives,
  aa as maskDirective,
  la as modelDirective,
  ua as moneyMask,
  ca as newApp,
  ul as newFn,
  Zf as onDirective,
  Pf as propsDirective,
  Vf as resizeDirectives,
  Mf as scriptDirective,
  oa as setDefaultMaskTokens,
  _i as settings,
  Ta as setup,
  Wf as showDirective,
  Ff as styleDirective,
  Kf as teleportDirective,
  xf as templateDirective,
  qf as transitionDirectives,
  $f as uidDirective
};
