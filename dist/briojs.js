let wl = "brio", Ht = "$", ke = "after", ri = "animation", si = "append", ct = "array", rt = "attr", fi = "Attribute", k = "b-", me = "before", kl = "begin", fs = "body", jt = "boolean", Ml = "both", as = "cache", ir = "can only be used on", rr = "Cannot ", Qe = "checkbox", et = "checked", ns = "classList", Pi = "closest", ai = "composi", Es = "Content", st = "create", Ol = "data", sl = "debounce", sr = "detail", fr = "define", B = "delete", xe = "directive", ml = "disconnect", Ul = "display", ni = "document", ar = "each", Ye = "element", Qt = "end", Ei = "Engine", Di = "entries", Fl = "error", Ve = "evalEffect", Bl = "event", nr = "EventListener", Er = "exit", ci = "ctxArgs", Mt = "get", cs = "head", wi = "href", ot = "html", cr = "HTML", Tt = "hydrate", or = "in", Tr = "index", Il = "inner", mt = "insert", ur = "Invalid", Kl = "length", St = "mask", os = "method", yr = "must be", he = `
`, $e = "newValue", dt = "name", Ar = "Node", bt = "not found.", Ge = null, ie = "number", Ut = "object", Rr = "observe", Ct = "oldValue", oi = "on-", ki = oi + "enter", $i = oi + Er, bi = oi + "resize", Sr = "once", fl = "onComplete", ft = "onSet", hr = "operation", de = "options", Or = "out", Ti = "outer", Lt = "parent", Li = "patch", He = "pause", ae = "play", Ts = "post", us = "prepend", Ir = "prevent", _r = "Propert", ui = _r + "y", se = "props", Nr = "put", xi = "radio", ht = "remove", pr = "replace", yi = "requires", ee = "reverse", Ue = "route", Z = "script", ys = "Sibling", Ft = "skip", j = "select", Te = "state", dr = "start", Ai = "storage", Me = "string", v = "style", Cr = "teleport", re = "template", oe = "text", Hi = "throttle", Ri = "tion", gr = "toString", al = "tokens", Dt = "transition", Pr = "type", ut, Yl = "update", Dr = "validate", C = "value", wr = "With", As = "add" + nr, Gl = Ht + Ol, nl = Ht + ar, Mi = Ht + se, Ie = k + Ol, zl = "b-if", Jt = "b-show", Rs = as + "Exp", Ss = "clone" + Ar, El = ai + "ng", hs = ai + Ri + dr, Os = ai + Ri + Qt, Is = st + "Element", Wl = fr + ui, _s = fr + _r + "ies", kr = "de" + Tt, mi = B + ui, $r = xe + "s", _l = "func" + Ri, Ns = Mt + fi, J = Il + cr, K = "in" + Nr, ps = mt + "AdjacentHTML", ql = St + "s", br = St + "Token", Vl = br + "s", ds = "next" + ys, Cs = "of " + Pr, gt = Ti + cr, Lr = "Own" + ui, gs = Lt + Ar, $l = "path" + dt, Ps = Ir + "Default", xr = "proto" + Pr, Ds = ht + fi, ws = ht + nr, cl = pr + wr, Ui = Ue + "Rule", bl = j + "ionStart", ks = "set" + fi, $s = dr + "s" + wr, bs = Ai + "Area", ol = "tar" + Mt, tt = oe + "area", Fe = oe + Es, Ls = "async" + _l, Hr = Mt + Lr + "Descriptor", xs = Hr + "s", Hs = "has" + Lr, Mr = (e, t, l, i) => `the ${e} ${t} ${yi} ${l}, ` + mr(i), mr = (e) => `but got ${e} instead.`, G = (e, t) => e.push(t), Si = (e, t) => e.sort(t), Ms = (e) => e[ee](), _e = (e, t) => e.join(t), P = (e, t) => e.forEach(t), ye = (e, t, l) => e.map(t, l), at = (e, t, l) => e.filter(t, l), ms = (e, t, l) => e.find(t, l), hi = (e, t, l) => e.every(t, l), Ur = (e, t, l) => e.findIndex(t, l), Fr = (e, t, l) => e.indexOf(t, l), Br = (e, t) => t[1] - e[1], Ot = (e) => Array.from(e), Us = (e, t = 0) => ye(Ot({ [Kl]: e }), (l, i) => t + i), Fs = (e, t) => e[gr](t), W = (e) => e.trim(), Xe = (e) => e.toLowerCase(), q = (e, t, l) => e.split(t, l), Oi = (e, t) => e.match(t), nt = (e, t, l) => e[$s](t, l), ze = (e, t) => t.test(e), fe = (e, t, l) => e[pr](t, l), Bs = (e) => ze(e, /^\d+$/), Ks = (e) => ze(W(e), /^((async\s+)?function\s*\([^)]*\)\s*{[^}]*}|(async\s*)?(?:\([^()]*\)|[$\w]+)\s*=>)/), Ys = (e) => JSON.stringify(e), Ii = (e, t) => {
  try {
    e = JSON.parse(e, t);
  } catch {
  }
  return e;
}, Gs = (e) => {
  let t = Fs(new URLSearchParams(e));
  return t ? "?" + t : "";
}, _i = (e) => "`" + fe(e, /`/g, "\\`") + "`", xt = (e) => Xe(Ee(Se[xr][gr].call(e), 8, -1)), je = (e, t) => xt(e) === t, Ne = (e) => e === Ge, We = (e) => e === ut, It = (e) => je(e, Ut), Re = (e) => je(e, ct), Bt = (e) => zs(e) || Ws(e), zs = (e) => je(e, _l), Ws = (e) => je(e, Ls), qe = (e) => je(e, Me), Kr = (e) => je(e, ie) && isFinite(e), qs = (e) => je(e, jt), Vs = (e) => Nl(e, Yr), Nl = (e, t) => e instanceof t, yt = (e) => Nl(e, Node), Xs = (e) => Nl(e, Text), wt = (e) => Nl(e, HTMLElement), we = window, Se = Object, Je = Reflect, Zt = location, Kt = we[ni], Yr = RegExp, Q = (e, t, l) => It(e) && t in e ? e[t] : l, js = (e) => {
  let t = ul();
  for (; t in e; ) t = ul(12);
  return t;
}, kt = (e) => Y(Ae(e)), Qs = (e, ...t) => {
  P(t, ([l, i]) => {
    l in e && (e[i] = e[l], Yt(e, l));
  });
}, Ae = (e) => Se.keys(e), Js = (e = Ge) => Se[st](e), Zs = (e, t = {}) => {
  const l = Js(e);
  return Se[_s](
    l,
    Se[xs](t)
  ), l;
}, vs = (e, t, l = Se) => l[Hr](e, t), ef = (e) => Se.getPrototypeOf(e), At = (e, t) => Se[xr][Hs].call(e, t), ne = (e, t, l = {}) => {
  Qs(l, ["v", C], ["w", "writable"], ["e", "enumerable"], ["c", "configurable"]), Se[Wl](e, t, l);
}, Gr = (e, t = {}) => {
  P(Ae(e), (l) => {
    ne(e, l, t);
  });
}, Yt = (e, t) => delete e[t], tf = (e) => P(Ae(e), (t) => {
  Yt(e, t);
}), Ce = () => /* @__PURE__ */ new Map(), lf = (e, t) => new Yr(e, t), M = (e, t, l) => e.includes(t, l), Ni = (e) => It(e) ? Se[Di](e) : e[Di](), Ee = (e, t, l) => e.slice(t, l), Y = (e) => We(e[Kl]) ? e.size : e[Kl], ge = (e, t = 0) => setTimeout(e, t), Tl = (e, t) => {
  let l;
  return (...i) => {
    clearTimeout(l), l = ge(() => e(...i), t);
  };
}, rf = (e, t) => {
  let l = 0;
  return (...i) => {
    let r = Date.now();
    if (!(r - l < t))
      return l = r, e(...i);
  };
}, sf = () => crypto.randomUUID(), ul = (e = 8) => "b" + Ee(fe(sf(), /-/g, ""), 0, e - 1), zr = (e, ...t) => console[e]("Brio.js", ...t), Wr = (...e) => zr("warn", "warn:", ...e), x = (...e) => zr(Fl, `detected an ${Fl}:`, ...e), Rt = (e, t = Kt) => Ot(t.querySelectorAll(e)), F = (e, t = Kt) => qe(e) ? Rt(e, t)[0] : e, ce = (e, t, ...l) => e[t](...l), ff = (e, t, l) => {
  t == J || t == gt ? e[t] = l : e[ps](t, l);
}, af = (e, t, l) => {
  l && te(l) ? ce(l, me, e) : ce(t, si, e);
}, nf = (e) => e[Ss](!0), Fi = (e) => {
  let t = te(e);
  if (t) {
    let l = ue(t), i = Fr(l, e), r = Ms(Ee(l, 0, i)), n = Ee(l, i + 1);
    return () => {
      let a = !1;
      for (let E of n)
        if (te(E) == t) {
          ce(E, me, e), a = !0;
          break;
        }
      if (!a) {
        for (let E of r)
          if (te(E) == t) {
            ce(E, ke, e), a = !0;
            break;
          }
      }
      a || ce(t, si, e);
    };
  }
}, Xl = (e, t) => P(Ot(e.attributes), ({ name: l, value: i }) => t(l, i)), yl = (e) => e[ht](), te = (e) => e[gs], Ef = (e) => e[ds], qr = (e) => W(e[Fe] || ""), ue = (e) => [...e.childNodes], z = (e, t) => e[Ns](t), pl = (e, t, l, i) => {
  i && (e[i] = l), e[ks](t, l);
}, dl = (e, t) => e[Ds](t), pi = (e, t) => Kt[Is](e, t), cf = (e) => new DOMParser().parseFromString(e, oe + "/" + ot), pe = (e) => Xe(e.tagName || ""), Oe = (e, t, l, i) => (qe(e) && (e = F(e)), e[As](t, l, i), () => e[ws](t, l)), Be = (e, t, l) => F(e).dispatchEvent(new CustomEvent(Xe(fe(t, /[^a-z\d]/gi, "")), {
  bubbles: !0,
  cancelable: !0,
  [sr]: l
})), jl = async (e, t) => {
  if (await t(e))
    for (let l of ue(e))
      await jl(l, t);
}, of = (e) => e[ol][El] = !0, Tf = (e) => {
  let t = e[ol];
  t[El] && (t[El] = !1, Be(t, K));
}, Vr = (e) => we.getComputedStyle(e), uf = (e) => {
  let t = Vr(e);
  return !(!te(e) || t[Ul] == "none" || t.visibility == "hidden" || t.opacity == "0");
}, yf = (e, t) => new URL(e, t), vt = (e = "", t = wi) => yf(e, Zt[wi])[t], Xr = (e) => M(["src", C, et, j + "ed"], e), Bi = (e, t = "") => `:not([${e}]${t})`, Af = (e, t, l) => async (i, r, n, a) => {
  let E = r == Ti ? gt : r == Il ? J : r == oe ? Fe : r == me ? me + kl : r == "first" ? ke + kl : r == "last" ? me + Qt : r == ke ? ke + Qt : r, s = "$dom." + mt, f = F(n), c = F(cs), T = F(fs);
  if (!f) return x(s, Ye, bt);
  (c == f || T == f) && (E = J);
  let y = F(ot) == f, O = E == Fe, D = O || E == J, R = E == gt, N = D ? f : te(f);
  if (!N && !y) return x(s, Lt, Ye, bt);
  i = await i, i in l && (i = l[i]());
  let p = yt(i) ? i : cf(i), L = Q(a, j);
  L && (i = F(L, p)), yt(i) && (i = i[gt]), (R || y) && t(f, !1), D && P(ue(f), (h) => t(h));
  let m = new Set(ue(f));
  N && P(ue(N), (h) => m.add(h));
  let le = (h) => at(ue(h), (w) => !m.has(w)), H = [];
  y ? (f[J] = F(ot, p)[J], H = [f, ...Rt(Z, f)]) : D ? (f[O ? Fe : J] = i, H = ue(f)) : R ? (f[gt] = i, H = le(N)) : (ff(f, E, i), H = le(E == me + kl || E == ke + Qt ? N : f)), Si(H, (h, w) => {
    let g = pe(h) == v, I = pe(w) == v;
    return g && !I ? -1 : I && !g ? 1 : 0;
  }), P(H, (h) => {
    if (
      // is script element
      pe(h) == Z && // is not b-script
      Ne(z(h, k + Z)) && // should load: !(b-load-once attribute AND script already loaded)
      !(!Ne(z(h, "b-load-" + Sr)) && ts.has(z(h, "src")))
    ) {
      let w = pi(Z);
      Xl(h, (g, I) => pl(w, g, I, Xr(g) && g)), w[J] = h[J], ce(h, cl, w);
    }
  }), Q(a, Tt, !0) && P(H, (h) => e(h, f));
}, Nt = (e) => async (t, l, i = {}) => {
  let r = "status", n = Q(i, "parser");
  M([Mt, B], e) && It(l) && (t += Gs(l), l = ut);
  try {
    let a = await fetch(t, { ...i, [os]: e, body: l });
    if (!a.ok) {
      let s = new Error(`HTTP ${Fl}! ${r}: ${a[r]}`);
      throw s.response = a, s;
    }
    let E = await a[n || oe]();
    if (!n)
      try {
        E = Ii(E);
      } catch {
      }
    return E;
  } catch (a) {
    throw a;
  }
}, Al = {
  get: Nt(Mt),
  post: Nt(Ts),
  put: Nt(Nr),
  [Li]: Nt(Li),
  [B]: Nt(B)
}, Rf = (e, t, l) => [
  // Set a route
  (i, r) => {
    if (Bt(r)) {
      i = vt(i, $l);
      let n = at(q(i, "/"), W), a = Y(n) - 1, E = e;
      P(n, (s, f) => {
        s in E || (E[s] = {}), E = E[s], f == a && (E[Pt] = r);
      });
    } else x(rr, "set route without a", Ue, _l, he, i);
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
    if (!nt(vt(i), Zt.origin))
      return Zt.href = i, Ge;
    i = vt(i, $l);
    let r = at(q(i, "/"), W), n = e, a = {}, E = 0;
    for (let s of r) {
      if (E = 0, s in n && !nt(s, ":"))
        n = n[s], E = 1;
      else for (let f of Ae(n))
        if (nt(f, ":")) {
          let [c, T] = at(q(f, ":"), W);
          if (!T || T && T in t && t[T](s)) {
            let y = a[c];
            y ? Re(y) ? G(y, s) : a[c] = [y, s] : a[c] = s, n = n[f], E = 1;
            break;
          }
        }
      if (!E) break;
    }
    return E = E && n[Pt] ? 1 : 0, E ? n[Pt]({
      params: a,
      path: i,
      [ht]: () => Yt(n, Pt)
    }) : l(Al.get(i), Ti, ot), i != Zt[$l] && history.pushState(Ge, "", i), !!E;
  }
], el = [], Sf = () => {
  let e = Ce(), t = (l, i) => {
    let r = el.find((n) => n[Dr](l));
    if (r)
      return e.has(l) || r[fl](l, () => {
        e.get(l)();
      }), e.set(l, i), r;
    x(ri, Xe(Ei), bt, he, l);
  };
  return [
    /**
     * Plays the animation towards the end
     * 
     * When used with $hook, this function is usually called before the main hook function
     * 
     * This allows the animation to transition the element out of view
     */
    (l, i = !1, r) => {
      let n = Q(r, ae, () => {
      }), a = Q(r, He, () => {
      });
      !e.has(l) && !i && n();
      let E = t(l, n);
      !E || i ? n() : (a(), E.play(l, n));
    },
    /**
     * Plays the animation towards the start (in reverse)
     * 
     * When used with hook, this function is usually called after the main hook function
     * 
     * This allows the animation to transition the element into view
     */
    (l, i = !0, r) => {
      let n = Q(r, ae, () => {
      }), a = Q(r, He, () => {
      }), E = t(l, n);
      E && i ? (a(), E[ee](l, n)) : n();
    }
  ];
}, hf = (e) => {
  if (!e || !hi([dt, Dr, ae, ee, fl], (t) => t in e))
    x(ur, ri, Xe(Ei), e ? e[dt] : "");
  else {
    let t = Ur(el, (l) => l[dt] == e[dt]);
    t >= 0 ? el[t] = e : G(el, e);
  }
}, Of = (e) => {
  let t = ({ prop: l }, i) => (Ke[B](t), i[Ft].add(l), e);
  return Ke.add(t), t;
}, Ql = !1, Jl = [], jr = (e) => (Jl = [], Ql = !0, e({}), Ql = !1, [...Jl]), If = (e) => {
  let t = jr(e), l = [];
  for (let r of t) {
    let n = Y(l) - 1, a = l[n];
    a && a[0][a[1]] === r[0] ? l[n] = r : G(l, r);
  }
  l = l.filter((r) => r[1] in r[0]).filter(([r, n], a, E) => Ur(E, ([s, f]) => r === s && n == f) == a);
  let i;
  if (Y(l) == 1) {
    let [r, n] = l[0];
    i = (a) => We(a) ? r[n] : r[n] = a;
  }
  return i;
}, Pe = (e, t) => {
  if (!Ki(e) || be(e)) return e;
  let l = Q(t, Lt, Ge);
  t = { [Lt]: l };
  let i = {
    get(E, s) {
      return Ql && (At(E, s) || !(s in E)) && G(Jl, [r, s]), Je.get(E, s, r);
    },
    set(E, s, f) {
      s in E || ne(E, s, { w: !0, e: !0, c: !0 });
      let c = r[s];
      if (c === f) return !0;
      let T = lt(r);
      Ke.has(f) && (f = f({ [Te]: r, prop: s, [$e]: f, [Ct]: c }, T, f)), n.has(s) || (f = Pe(f)), be(c) && be(f) && ($t.set(f, lt(c)), $t[B](c));
      let y = Je.set(E, s, f, r);
      return T[ft][s] && P(T[ft][s], (O) => O({ [Te]: r, prop: s, [$e]: f, [Ct]: c }, T, O)), Yi(T, r, s, f, c), y;
    },
    [mi](E, s) {
      let f = E[s], c = Je[mi](E, s);
      return Yi(lt(r), r, s, ut, f), c;
    },
    [Wl](E, s, f) {
      let c = f[C], T = r[s];
      return Ke.has(c) && (f[C] = c({ [Te]: r, prop: s, [$e]: c, [Ct]: T }, lt(r), c)), !n.has(s) && C in f && (f[C] = Pe(f[C])), Je[Wl](E, s, f);
    }
  };
  const r = new Proxy(be(l) ? Zs(l, e) : e, i), n = /* @__PURE__ */ new Set();
  let a = {
    [Te]: Ce(),
    [se]: {},
    skip: n,
    [ft]: {}
  };
  $t.set(r, a);
  for (let E in e) {
    let s = e[E];
    Ke.has(s) ? (s = s({ [Te]: r, prop: E, [$e]: s, [Ct]: ut }, a, s), Je.set(e, E, s, r)) : !n.has(E) && Ki(s) && Je.set(e, E, s, r);
  }
  return r;
}, Ki = (e) => Re(e) || It(e), Yi = (e, t, l, i, r) => {
  let n = We(r) ? st : We(i) ? B : Yl, a = {
    [hr]: n,
    [Te]: t,
    prop: l,
    [$e]: i,
    [Ct]: r
  };
  Gi(e[Te], a), e[se][l] && Gi(e[se][l], a);
}, Gi = async (e, t) => {
  let l = Ot(e);
  Si(l, Br);
  for (let [i] of l) await i(t);
}, _f = (e, t, l) => {
  e[ft][t] || (e[ft][t] = /* @__PURE__ */ new Set()), e[ft][t].add(l);
}, Qr = "getItem", Jr = "setItem", Zl = Ce(), Nf = (e) => {
  let t = ef(e);
  return t && At(t, Qr) && At(t, Jr);
}, vl = (e, t) => Ii(e[Qr](t) || ""), zi = (e, t, l) => e[Jr](t, Ys(l)), Wi = (e) => "_b_" + e, Zr = (e, t, l) => {
  if (!Nf(e))
    return x(ur, Ai, Ut);
  l && (l = Wi(l), At(e, l) && (t = vl(e, l)));
  let i = ({ state: r, prop: n }, a) => {
    Ke[B](i), Zl.set(l, [r, n, e]), l = l || Wi(n), At(e, l) ? t = vl(e, l) : zi(e, l, t);
    let E = () => zi(e, l, r[n]);
    return ge(() => Et(r, n, E)), _f(a, n, ({ state: s, prop: f }) => {
      be(s[f]) && Et(s[f], "", E);
    }), t;
  };
  return Ke.add(i), i;
}, pf = (e) => {
  if (Zl.has(e.key)) {
    let [t, l, i] = Zl.get(e.key);
    i === e[bs] && (t[l] = vl(i, e.key));
  }
}, tl = (e, t, l = 0) => {
  let i = [], r = jr(t || e);
  return P(r, ([n, a]) => {
    G(i, es(n, a, e, l));
  }), t && e({}), () => P(i, (n) => n());
}, Et = (e, t, l, i = 0) => (
  // If the proxied object is not an observed state, log an error and return an empty function
  !be(e) && !x(rr + `watch non-${Te} ${Ut}/${ct}.`) ? () => {
  } : At(e, t) ? es(e, t, l, i) : vr(e, l, i)
), $t = Ce(), Ke = /* @__PURE__ */ new Set(), be = (e) => $t.has(e), lt = (e) => $t.get(e), vr = (e, t, l = 0) => {
  if (be(e)) {
    let i = lt(e)[Te];
    return i.set(t, l), () => i[B](t);
  }
}, es = (e, t, l, i = 0) => {
  let r = lt(e)[se];
  r[t] || (r[t] = Ce()), r[t].set(l, i);
  let n = vr(e[t], l, i);
  return () => {
    r[t][B](l), n && n();
  };
};
ne(Pe, "persist", { v: (e, t) => Zr(localStorage, e, t) });
ne(Pe, "session", { v: (e, t) => Zr(sessionStorage, e, t) });
ne(Pe, Ft, { v: Of });
let Rl = (e, t, l = !0) => new Function(e, l ? `return(${t})` : t), df = (e, t) => t ? _i(e) : it(e), Cl = (e, t = "", l = !0) => (Ks(e) || (e = df(e, l == oe), e = `(${t})=>` + (l ? `(${e})` : `{${e}}`)), e), qi = (e, t, l) => {
  let i = e.get(t);
  return i && i[l];
}, Cf = (e) => [
  // Adds a hook to a target
  (t, l, i, r = 0) => {
    Bt(i) && (e.has(t) || e.set(t, {}), e.get(t)[l] || (e.get(t)[l] = Ce()), qi(e, t, l).set(i, r));
  },
  // Calls all the functions under a hook name on a target by priority
  async (t, l, i) => {
    let r = qi(e, t, l);
    if (r && Y(r)) {
      let n = Ot(r);
      Si(n, Br);
      let a = -1, E = !0, s = async () => {
        if (a++, E = !0, a < Y(n)) {
          let f = a;
          await n[f][0](
            /** Contextual data, if any */
            i,
            {
              /** Call the next function */
              play: s,
              /** Disable the auto-run feature and choose when/if to call the next function */
              [He]: () => E = !1,
              /** Remove the current function */
              [ht]: () => r[B](n[f][0])
            }
          ), E && await s();
        }
      };
      await s();
    }
  }
], Pt = Symbol(), di = {}, ts = /* @__PURE__ */ new Set(), ha = () => {
  let e = (o) => O.get(o), t = (o, A = () => !0) => {
    let u = o ? te(o) : Ge;
    for (; u; ) {
      let S = e(u);
      if (S && kt(S[rt]) && A(S)) return S;
      u = te(u);
    }
  }, l = (o, A) => {
    let u = e(o);
    if (!u) {
      let S = A ? e(A) : t(A || o);
      u = {
        // Local context
        // @ts-ignore
        ctx: { ...Gt },
        // A reference to the element. Convenience for internal use.
        el: o,
        // UID context
        uid: Q(S, "uid", {}),
        /** Attributes or directives */
        attr: {},
        /** Cleanup functions */
        cFns: [],
        ...Pl,
        ..._t
      };
      for (let d in H) {
        let $ = H[d](u, S);
        $ && ne(u.ctx, d, { v: $, e: !0 });
      }
      O.set(o, u);
    }
    return u;
  }, i = (o, A, u, S) => {
    let d = o.el;
    h(d, A, S(d));
    let $ = y(o, u);
    V(o, tl(() => w(d, A, $)));
  }, r = (o, A) => {
    qe(o) && (o = F(o)), qe(A) && (A = F(A)), yt(A) || (A = ut), yt(o) && (f(o), jl(o, async (u) => {
      let S = !1, d = o == u ? A : ut;
      if (Xs(u) && qr(u))
        S = a(u, d);
      else if (wt(u))
        if (pe(u) == re) {
          let b = pi("div");
          Xl(u, (De, zt) => pl(b, De, zt)), b[J] = u[J], ce(u, cl, b), r(b, d), ge(() => ce(b, cl, ...ue(b)));
        } else
          S = await E(u, d);
      return S;
    }));
  }, n = (o, A = !0, u = !0) => {
    jl(o, (S) => {
      let d = e(S);
      return d && (P(d.cFns, ($) => $()), u && O[B](S), A && yl(S)), !0;
    });
  }, a = (o, A) => {
    let u = o[Fe], S = ls(it(u || ""));
    if (S && ze(S, il)) {
      let d = l(o, A), $ = y(d, `$el.${Fe}=${_i(S)}`, "", !1);
      V(d, tl($)), ll(d, oe, u);
    }
    return !1;
  }, E = async (o, A) => {
    let u = l(o, A);
    if (!We(pt(u))) return !0;
    u[de] = s(u, k + de)();
    for (let [S, d] of R) {
      let $ = [];
      if (Vs(S))
        Xl(o, (b, De) => {
          ze(b, S) && G($, [b, De]);
        });
      else {
        let b = z(o, S);
        Ne(b) || G($, [S, b]);
      }
      for (let [b, De] of $) {
        if (pt(u)) break;
        ll(u, b, De), await d(u, b, it(De));
      }
      if (pt(u)) break;
    }
    return We(pt(u)) && (u.skip = !1), !kt(u[rt]) && !A && O[B](o), !pt(u);
  }, s = (o, A, u = "{}") => {
    let S = it(z(o.el, A) || u);
    return ll(o, A, S), y(o, S);
  }, f = (o) => {
    let A = k + "save";
    if (wt(o)) {
      let u = Rt(re + `,[${A}]`, o);
      (z(o, A) || pe(o) == re) && G(u, o), P(u, (S) => {
        let d = z(S, A);
        dl(S, A);
        let $ = pe(S);
        if ($ == re && P(ue(S.content), (b) => f(b)), d) {
          let b = $ == Z, De = b ? Z : $ == v ? v : re, zt = S[J];
          _t[De][d] = b ? Rl(Dl, it(zt), !1) : zt, Ne(z(S, k + Tt)) && yl(S);
        }
      });
    }
  }, c = (o) => (A, u) => {
    _t[o][A] = u;
  }, T = (o, A = "", u = !0) => {
    let S;
    return o = Cl(o, A, u), o in le ? S = le[o] : (S = js(m), m[S] = Rl(Dl, o), le[o] = S), S;
  }, y = (o, A, u = "", S = !0) => {
    let d;
    try {
      let $ = A in m ? A : T(A, u, S);
      d = m[$](o.ctx);
    } catch ($) {
      x($.message), d = () => Pt;
    }
    return d;
  }, O = Ce(), D = Ce(), R = [], N = {}, p = {}, L = { [ie]: Bs }, m = {}, le = {}, H = {
    // The element itself
    $el: (o) => o.el,
    // References to `b-ref` elements under the same $data context, not including nested $data contexts
    $refs: (o, A) => !A || wt(o.el) && !Ne(z(o.el, Ie)) ? {} : A.ctx.$refs,
    // Unique identifier for the element
    $uid: (o) => (A) => `${A}-${o.uid[A]}`,
    // Reactive properties defined in the element or inherited from the parent context
    [Mi]: Vi(Mi, k + se, !0),
    // The $data context
    [Gl]: Vi(Gl, Ie),
    // The $each context
    [nl]: (o, A) => A == null ? void 0 : A.ctx[nl]
  }, [h, w] = Cf(D), g = Af(r, n, N), [I, _] = Rf(p, L, g);
  di[Ue] || Xi(_);
  let U = ri + Ei, X = {
    hook: h,
    [Ue]: I,
    router: Xi,
    [Ui]: c(Ui + "s"),
    [re]: c(re),
    [v]: c(v),
    [Z]: c(Z),
    [se]: c(se),
    data: c(Ol),
    mask: c(ql),
    [br]: c(Vl),
    [U]: hf
  }, Pl = {
    [Tt]: r,
    [kr]: n,
    [mt]: g,
    [Ue]: _,
    emit: Be,
    listen: Oe,
    query: F,
    queryAll: Rt,
    /** Get the closest parent element of a target element that has a directive (b-data by default) */
    [Pi](o, A = Ie) {
      let u = t(F(o), (S) => A in S[rt]);
      return u || x(Pi + ":", Ye, bt), u == null ? void 0 : u.el;
    },
    /** Get the local context of an element */
    context: (o) => {
      var A;
      return (A = e(F(o))) == null ? void 0 : A.ctx;
    }
  }, Gt = {
    $dom: Pl,
    $http: Al,
    $set: X,
    $store: Pe({}),
    $state: Pe,
    $watch: Et,
    $effect: tl
  }, Dl, gi = () => Dl = `{${_e(Ae(Gt))},${_e(Ae(H))}}`;
  gi();
  let _t = {
    [re]: N,
    [v]: {},
    [Z]: {},
    [se]: {},
    data: {},
    // ! HYDRATION
    lcFns: H,
    [$r]: R,
    vnodes: O,
    hooks: D,
    [ql]: {},
    [Vl]: {},
    routes: p,
    routeRules: L,
    // ! PUBLIC CONTEXT
    gc: Gt,
    // ! TOOLS
    exec: y,
    [Rs]: T,
    [ci]: gi,
    [Ve]: i,
    vnode: [l, e],
    hook: [h, w],
    [Dt]: Sf()
    // insert,
    // route: [SetRoute, Route],
  };
  return P([X, Pl, Al, Gt, _t], (o) => Gr(o, { w: !1, c: !1 })), _t;
}, pt = (e) => e.skip, V = (e, t) => {
  G(e.cFns, t);
}, ll = (e, t, l) => {
  e[rt][t] = l, wt(e.el) && dl(e.el, t);
}, it = (e) => fe(W(_e(ye(q(e, he), (t) => nt(W(t), "//") ? "" : t), he)), /;$/, ""), il = /\${((?!.*\${).*?)}/, ls = (e) => {
  let t = /{{((?!.*{{).*?)}}/;
  for (; ze(e, t); )
    e = fe(e, t, "${$1}");
  return e;
}, Vi = (e, t, l) => (i, r) => {
  let n = i.el, a = r ? r.ctx[e] : Ge, E = wt(n), s = E && !Ne(z(n, t)), f = E && (!a || s);
  return f && !s && t == Ie && pl(n, Ie, ""), f ? Pe({}, { [Lt]: l && a }) : a || {};
}, Xi = (e) => {
  Bt(e) && (di[Ue] = () => e(vt()));
}, Oa = (e = {}) => {
  wl in we || (Gr(e, { w: !1, c: !1 }), ne(we, wl, { v: e }), Oe(we, Ai, pf), Oe(we, "pop" + Te, di[Ue]), Be(we, wl));
}, gl = (e, t) => Ee(e, nt(e, k) ? t : t - 2), gf = async (e, t, l) => {
  e[Ft] = !l || !!await e.exec(e, l)();
}, Pf = ["b-ignore", gf], Df = (e, t, l) => {
  let i = e.el, [r, n] = e.vnode, [a, E] = e.hook;
  e[Ft] = !0;
  let [s, f] = ye(q(l, " in "), W), [c, T] = ye(q(s, ","), W);
  T || (T = Tr);
  let y = `the ${t} ${xe} ` + yi;
  if (!ji(c) || !ji(T))
    return x(y, "a valid alias.");
  let O = e.exec(e, f)(), D = be(O);
  if (Kr(O) && (O = Us(O, 1)), !(Re(O) || It(O)))
    return x(y, `an ${ct}, ${Ut}, or ${ie}.`);
  let R = Ef(i), N = te(i);
  yl(i);
  let p = {}, L = t + "-" + st, m = t + "-" + Yl, le = t + "-" + B;
  a(i, L, ([h, w]) => {
    let g = nf(i);
    af(g, N, R);
    let I = r(g);
    ll(I, "", "");
    let _ = Pe({});
    ne(_, c, { v: w, w: !0, e: !0 }), ne(_, T, { v: h, w: !0, e: !0 }), ne(I.ctx, nl, { v: _, e: !0 }), V(I, Et(_, T, ({ [$e]: U }) => {
      let X = p[h][1];
      U !== X && (_[T] = X);
    })), D && V(I, Et(_, c, ({ [$e]: U }) => {
      O[_[T]] = U;
    })), p[h] = [g, h], e[Tt](g);
  }), a(i, m, ([h, w]) => {
    let g = p[h], I = n(g && g[0]);
    if (I) {
      let _ = I.ctx[nl];
      _[c] = w, _[T] = h, g[1] = h;
    }
  }), a(i, le, ([h, w]) => {
    let [g] = p[h];
    e[kr](g), Yt(p, h);
  });
  let H = {
    [st]: (h) => E(i, L, h),
    [Yl]: (h) => E(i, m, h),
    [B]: (h) => E(i, le, h)
  };
  for (let h of Ni(O))
    H[st](h);
  D && V(e, Et(O, "", ({ [hr]: h, prop: w, [$e]: g }) => {
    H[h]([w, g]);
  }));
}, ji = (e) => ze(e, /^[a-z_$][\w$]*$/i), wf = [k + ar, Df], kf = async (e, t) => {
  let [l, i] = e.hook, r = e.el;
  l(r, t, () => {
    let n = e.ctx.$refs, a = ` [${t}]`, E = Rt(a + Bi(Ie) + Bi(Ie, a), r);
    P([r, ...E], (s) => {
      let f = z(s, t);
      if (f) {
        let c = n[f];
        c ? Re(c) ? G(c, s) : n[f] = [c, s] : n[f] = s, dl(s, t);
      }
    });
  }), await i(r, t);
}, is = async (e, t, l) => {
  let [i, r] = e.hook, n = t == Ie, a = n ? Ol : se, E = e[a], s = l ? E[l] || Rl(e[ci](), l) : () => ({}), f = e.ctx[Ht + a];
  i(e.el, t, async () => {
    let c = await s(e.ctx);
    if (!It(c))
      return e[Ft] = !0, x(Mr(xe, t, "an " + Ut, xt(c)));
    for (let T in c) ne(f, T, vs(c, T));
    n && await kf(e, "b-ref");
  }), await r(e.el, t, f);
}, $f = [k + se, is], bf = [Ie, is], Wt = {}, Lf = async (e, t, l) => {
  if (l) {
    let i = e.el, [r, n] = e.hook;
    r(i, t, () => {
      let a = e.exec(e, l)();
      if (!Re(a) || !hi(a, qe))
        return x("the", t, xe, yr, `an ${ct} of ${Me}(s).`);
      e.uid = a.reduce((E, s) => (s in Wt ? Wt[s]++ : Wt[s] = 1, E[s] = Wt[s], E), {});
    }), await n(i, t);
  }
}, xf = ["b-uid", Lf], rs = (e) => (t, l, i) => {
  let r = t[re];
  i in r && (i = _i(r[i] || i)), i && t[Ve](t, l, i, (n) => async (a) => {
    await t[mt](a(), e, n);
  });
}, Hf = [k + ot, rs(Il)], Mf = [k + oe, rs(oe)], mf = (e, t, l) => {
  let i = e.el, r = e[re][l] || e.exec(e, l)(), [n, a] = e.hook;
  n(i, t, async () => {
    await e[mt](r, Il, i), ce(i, cl, ...ue(i));
  }), a(i, t);
}, Uf = [k + re, mf], Ff = async (e, t, l) => {
  let i = e.el, r = e[Z], n = pe(i) == Z;
  e.skip = n;
  let [a, E] = e.hook, s = l ? r[l] || e.exec(e, l)() : [];
  s = ye(
    Re(s) ? s : [s],
    (f) => r[f] || f
  ), a(i, t, async () => {
    if (n) {
      let f = z(i, "src");
      f && ts.add(f);
      let c = f ? await Al.get(f) : qr(i);
      c && G(s, it(c)), yl(i);
    }
    for (let f of s) {
      let c = f;
      qe(c) && (c = Rl(e[ci](), c, !1)), Bt(c) && await c(e.ctx);
    }
  }), await E(i, t);
}, Bf = [k + Z, Ff], Kf = (e, t, l) => {
  let i = e.el;
  if (l && pe(i) != v) {
    let [r, n] = e.hook, a = e[v], E = a[l] || e.exec(e, l)();
    E = ye(
      Re(E) ? E : [E],
      (f) => a[f] || f
    );
    let s = ul();
    r(i, t, () => {
      i[ns].add(s);
      let f = pi(v);
      f[Fe] = Yf(_e(E, he), "." + s), e[Tt](f, i), ce(i, ke, f);
    }), n(i, t, s);
  }
}, Yf = (e, t) => {
  e = fe(e, /\/\*[\s\S]*?\*\//g, ""), e = ls(e);
  let l = [], i = ul();
  for (; ze(e, il); ) {
    let s = Oi(e, il);
    s && (G(l, s[0]), e = fe(e, il, i));
  }
  let r = at(q(e, "}"), W), n = he + "    ", E = _e(ye(r, (s) => {
    let [f, c] = q(s, "{"), T = ye(
      ye(q(f, ","), W),
      (y) => M(y, "&") ? fe(y, /&/g, t) : t + " " + y
    );
    return c = _e(ye(at(q(c || "", he), W), W), n), _e(T, ",") + ` {${n + c + he}}`;
  }), he);
  return P(l, (s) => {
    E = fe(E, i, s);
  }), E;
}, Gf = [k + v, Kf], zf = (e, t, l) => {
  let i, r;
  try {
    i = F(l), yt(i) && (l = Cl(l, "", oe));
  } catch {
  }
  e[Ve](e, t, l, (n) => (a) => {
    try {
      let E = a();
      Re(E) ? [i, r] = E : i = F(E);
    } catch {
    }
    M([me, ke, us, si], r) || (r = ke), yt(i) ? ce(i, r, n) : Wr(Cr, Ye, bt, t + `="${l}"`);
  });
}, Wf = [k + Cr, zf], qf = (e, t, l) => {
  e[Ve](e, t, l, (i) => {
    let r = te(i), n = Fi(i);
    return (a) => {
      let E = a();
      ge(() => {
        if (E) n();
        else {
          let s = te(i);
          s && (s != r && (r = s, n = Fi(i)), i[ht]());
        }
      });
    };
  });
}, Vf = [zl, qf], Xf = (e, t, l) => {
  let i = Vr(e.el)[Ul];
  i == "none" && (i = "block"), e[Ve](e, t, l, (r) => (n) => {
    let a = n();
    te(r) && ge(() => {
      r[v][Ul] = a ? i : "none";
    });
  });
}, jf = [Jt, Xf], Qi = 1 / 0, Ll = (e) => (t, l, i) => {
  let r = t[rt][zl] ? zl : t[rt][Jt] ? Jt : "";
  if (!r)
    return x("the", l, xe, yr, "accompanied by an b-if or", Jt, xe);
  let [n] = t.hook, [a, E] = t[Dt], s = t.exec(t, i)();
  s[He](), (e == Or || e == Ml) && n(t.el, r, (f, c) => a(s, f, c), Qi), (e == or || e == Ml) && n(t.el, r, (f, c) => E(s, f, c), -Qi);
}, Qf = [
  [k + Dt, Ll(Ml)],
  [k + Dt + "-in", Ll(or)],
  [k + Dt + "-out", Ll(Or)]
], qt = (e, t, l) => {
  let [i, r] = e.hook, n = gl(t, 5), [a] = q(n, "-"), E = e[de][t] || {}, s = e.el, f = e.exec(e, l, "$entry", !1);
  i(s, t, Tl(f, E[sl] || 100));
  let c = new IntersectionObserver((T) => {
    P(T, async (y) => {
      y.isIntersecting != (a == Er) && (await r(s, t, y), E[Sr] && c[ml]());
    });
  }, E);
  c[Rr](s), V(e, () => c[ml]());
}, Jf = [
  [ki, qt],
  [k + ki, qt],
  [$i, qt],
  [k + $i, qt]
], Ji = (e, t, l) => {
  let [i, r] = e.hook, n = gl(t, 5);
  q(n, "-");
  let a = e.el, E = e[de][t] || {}, s = E[ni] ? F(ot) : a, f = e.exec(e, l, "$size", !1);
  i(a, t, Tl(f, E[sl] || 100));
  let c = new ResizeObserver((T) => {
    let y = T[0].borderBoxSize[0];
    r(a, t, [y.inlineSize, y.blockSize]);
  });
  c[Rr](s, E), V(e, () => c[ml]());
}, Zf = [
  [bi, Ji],
  [k + bi, Ji]
], Ze = "keyup", ve = "keydown", Zi = "outside", vf = "window", ss = "control", ei = "meta", Vt = "arrow", vi = [
  ei,
  ss,
  "shift",
  "alt",
  "fn"
], ea = {
  ctrl: ss,
  cmd: ei,
  super: ei,
  esc: "escape",
  del: B,
  up: Vt + "up",
  down: Vt + "down",
  left: Vt + "left",
  right: Vt + "right"
}, ta = (e, t, l) => {
  let [i, r] = e.hook, n = gl(t, 5), [a] = q(n, "-"), E = e.el, s = E, f = (R) => {
    let N = e.exec(e, l, Ht + Bl, !1);
    Bt(N) ? N(R) : x(Mr(Bl, t, "a " + _l, xt(N())));
  }, c = e[de][t] || {};
  sl in c && (f = Tl(f, c[sl])), Hi in c && (f = rf(f, c[Hi])), i(E, t, f), c[Zi] || c[ni] ? s = Kt : c[vf] && (s = we);
  let T = {};
  M([ve, Ze], a) && P(Q(c, "keys", []), (R) => {
    T[ea[R] || R] = !0;
  });
  let y = kt(T), O = a;
  if (M([ve, Ze], a) && y) {
    let R = {};
    a = t;
    let N = Tl((p) => {
      Be(s, a, p);
    }, 600);
    V(e, Oe(s, ve, (p) => {
      let L = Xe(p.key);
      R[L] || (R[L] = !0), ge(() => {
        R.meta && !M(vi, L) && xl(p, R);
      });
      let m = Ae(R);
      y > 1 && Ze == O && R.meta && !M(vi, L) ? N(m) : ve == O && Be(s, a, m);
    })), V(e, Oe(s, Ze, (p) => {
      ve == O && xl(p, R), Be(s, a, Ae(R)), Ze == O && xl(p, R);
    })), V(e, Oe(s, "focus", () => {
      tf(R);
    }));
  }
  V(e, Oe(s, a, (R) => {
    if (c[Ir] && R[Ps](), c.stop && R.stopPropagation(), !(c.self && R[ol] !== R.currentTarget) && !(c[Zi] && (E.contains(R[ol]) || !uf(E)))) {
      if (M([ve, Ze], O)) {
        let N = R[sr];
        if (!(kt(T) == kt(N) && hi(Ae(T), (p) => M(N, p))))
          return;
      }
      r(E, t, R);
    }
  }, c));
}, xl = (e, t) => {
  let l = Xe(e.key);
  t[l] && Yt(t, l);
}, la = [/^(b-on-|on-)[\w-]+$/, ta], ia = (e, t, l) => {
  let i = gl(t, 7);
  l = Cl(l || Gl + `['${i}']`, "$initial");
  let r = z(e.el, i) || "", n = e[de][t] || {};
  e[Ve](e, t, l, (a) => (E) => {
    let s = E(r), f = n.prop || Xr(i) && i;
    s || f ? pl(a, i, !f && s === !0 ? "" : s, f) : dl(a, i);
  });
}, ra = [/^(b-bind-|bind-)[\w-]+$/, ia], Xt = Ce(), sa = (e, t, l) => {
  let [i, r] = e.hook, n = `the ${t} ` + xe, a = yi + " a reactive " + C, E = j + "ed", s = e.el, f = pe(s), c = s.type;
  if (!M([K, tt, j], f))
    return x(n, ir, K, `, ${tt}, and ${j} ${Ye}s.`, s);
  let T = If(e.exec(e, l));
  if (!T) {
    x(n, a, s);
    return;
  }
  let y = T(), O, D = () => Ot(f == j ? s[de] : m()), R = e[de][t] || {}, N = (I) => {
    let _ = I[Ne(z(I, C)) && L ? et : C], U = Xt.get(I) || R;
    if (qe(_) && (U.trim && (_ = W(_)), !U.raw)) {
      let X = Ii(_);
      (Kr(X) || Ne(X) || qs(X)) && (_ = X);
    }
    return _;
  }, p = (I) => f == K && M(I, c), L = p([Qe, xi]), m = () => Rt(K + `[type="${Qe}"][name="${s.name}"]`), le = () => p(Qe) && Y(m()) > 1, H = () => {
    let I = [
      [K, Qe, [ie, Me, jt, ct]],
      [K, xi, [ie, Me, jt]],
      [K, ie, [ie]],
      [K, "range", [ie]],
      [K, "", [ie, Me]],
      [tt, "", [ie, Me]],
      [j, "", [ie, Me, jt, ct]]
    ];
    for (let [_, U, X] of I)
      if (f == _ && (!U || c == U)) {
        Ne(y) || We(y) || M(X, xt(y)) || Wr(n, a, Cs, _e(X, " or "), `for ${f == K ? c + " " : ""}${_} ${Ye}s,`, mr(xt(y)), s);
        break;
      }
  };
  ge(() => {
    H(), j == f ? P(D(), (I) => Xt.set(I, R)) : p(Qe) && Xt.set(s, R);
  }, 1);
  let h = () => {
    if (y = T(), O = N(s), M([K, tt], f))
      if (c == Qe && Re(y))
        s[et] = M(y, O);
      else if (L)
        s[et] = y === O;
      else {
        if (s[El] || Kt.activeElement === s && y === O) return;
        y !== O && (s[C] = y);
      }
    else f == j && (Re(y) ? P(D(), (I) => {
      I[E] = M(y, N(I));
    }) : s[C] = y);
  };
  ge(() => V(e, tl(h)), 5);
  let w = {};
  i(s, t, (I) => {
    if (y = T(), f == j && s.multiple || le()) {
      let _ = [];
      P(D(), (U) => {
        f == j && Xt.set(U, R), (U[E] || U[et]) && G(_, N(U));
      }), T(_);
    } else T(L && !s[et] ? !1 : N(s));
  }), (p([oe, "search", "url", "tel", "email", "password"]) || f == tt) && (w[hs] = of, w[Os] = Tf);
  let g = R.lazy || L || f == j ? "change" : K;
  w[g] = () => r(s, t, T);
  for (let [I, _] of Ni(w))
    V(e, Oe(s, I, _));
}, fa = ["b-model", sa], aa = (e) => {
  e["#"] = /\d/, e["&"] = /[\p{Letter}]/u, e["*"] = /[\p{Letter}\d]/u;
}, rl = "output", Le = "cursor", Ci = "character", ti = "quantifier", Sl = "isToken", hl = "isOptional", li = "isMultiple", ii = "parts", na = (e, t, l) => {
  let i = e.el, r = e[ql], [n, a] = e.hook;
  if (!(C in i && bl in i))
    return x("the", t, xe, ir, tt, Ye + "s and textual", K, "types (text, email, etc.).");
  let E = r[l], s = e[de][t] || {}, f = {
    ...s,
    [al]: { ...e[Vl], ...s[al] },
    mask: l,
    [C]: "",
    [Le]: i[bl],
    [ii]: [],
    [rl]: ""
  };
  n(i, t, () => {
    f[C] = i[C], f[C] != f[rl] && (f[ii] = [], f[Le] = i[bl], E && E(f), oa(f), i[C] = f[rl], i.setSelectionRange(f[Le], f[Le]), Be(i, St, f));
  }), ge(() => a(i, t), 7);
  let c = Oe(i, K, () => a(i, t), !0);
  V(e, c);
}, Ea = (e, t) => {
  let l = [], i = "\\";
  for (let r = 0; r < Y(e); r++) {
    let n = e[r], a = {
      [Ci]: n,
      [ti]: 1,
      [Sl]: !1,
      [hl]: !1,
      [li]: !1
    };
    if (n != i || n == i && e[r + 1] == i) {
      if (M(Ae(t), n) && (e[r - 1] != i || e[r - 2] == i)) {
        let E = Oi(Ee(e, r + 1), /^\d+/);
        if (E) {
          let f = E[0];
          r += Y(f), a[ti] = +f;
        }
        a[Sl] = !0;
        let s = e[r + 1];
        (s == "?" || s == "+") && (a[hl] = s == "?", a[li] = s == "+", r++);
      }
      G(l, a);
    }
  }
  return l;
}, ca = (e, t) => ms(Ee(e, t + 1), (l) => !l[hl]), er = (e, t, l) => {
  let i = -1;
  if (t) {
    let r = t[Ci];
    if (t[Sl]) {
      let n = Oi(e, l[r]);
      n && (i = n[Tr]);
    } else i = Fr(e, r);
  }
  return i;
}, oa = (e) => {
  let t = e[al], l = e[C], i = e[Le], r = Ea(e[St], t), n = "", a = l, E = Ee(l, i);
  for (let [s, f] of Ni(r)) {
    let c = f[Ci], T = f[ti];
    if (f[Sl]) {
      if (T > 0) {
        if (!a) break;
        let y = "";
        for (; a && (T > 0 || f[li]); ) {
          let O = f[hl] || T < 1, D = er(a, f, t), R = O && D > 0 && ca(r, +s), N = er(a, R, t);
          if (D < 0 || N >= 0 && D > N) {
            O || (a = "");
            break;
          }
          D || (y += a[0], T--), a = Ee(a, 1), E == a && (i = Y(n + y));
        }
        n += y, f[C] = y;
      }
    } else a && (E == a && (i = Y(n)), n += c, f[C] = c, a[0] == c && (a = Ee(a, 1)));
  }
  e[Le] = e[Le] == 0 ? 0 : e[Le] == Y(e[C]) ? Y(n) : i, e[rl] = n, e[ii] = r;
}, Ta = (e) => {
  let t = e[C], l = Q(e, "decimal", "."), i = Q(e, "thousands", ","), r = Q(e, "precision", 2);
  l == "," && (i = "."), i == "." && (l = ",");
  let n = q(t, l), a = n[0], E = nt(a, "-");
  a = fe(a, /\D/g, ""), a = a && (fe(a, /^0+/, "") || "0");
  let s = Y(n) > 1, f = s ? _e(Ee(n, 1), l) : "", c = Y(a), T = E ? "-" : "";
  for (let R = 0; R < c; R++)
    R > 0 && (c - R) % 3 == 0 && (T += i), T += "#";
  let y = e[al];
  t = E ? "-" + a : a, r > 0 && (y[l] = lf(`\\${l}`), s && (t += l + f), T += l + "#" + r), e[St] = T, E && (y["-"] = /-/), y["#"] = /\d/;
  let O = 0, D = "";
  for (let R of e[C])
    R == t[O] ? (D += R, O++) : D += "∅";
  e[C] = D;
}, ua = [k + St, na], ya = (e, t, l) => {
  l = Cl(l, "$controls", !1), e[Ve](e, t, l, () => async (i, r) => {
    await i(r);
  });
}, Aa = ["b-effect", ya], Ra = [
  // IMPORTANT: The `b-ignore` directive must be hydrated first because it stops the hydration of the element and its children.
  Pf,
  // IMPORTANT: The `b-each` directive must be hydrated second because it hydrates other directives for each item it iterates over.
  wf,
  // Context-related directives
  $f,
  bf,
  xf,
  Hf,
  Mf,
  Uf,
  Bf,
  Gf,
  // IMPORTANT: The `b-teleport` directive must be hydrated before the `b-if` directive because `b-if` restores the element to its original position.
  Wf,
  // Conditional directives: These directives usually depend on values from the context
  Vf,
  jf,
  // ['b-boost', hydrateBoost],
  ...Qf,
  // b-transition, b-transition-in, b-transition-out
  ...Jf,
  // [b-on|on]-enter, [b-on|on]-exit
  ...Zf,
  // [b-on|on]-resize
  la,
  // [b-on|on]-[eventName]
  /**
   * Data binding directives
   * Used to bind data to an element's property or attribute
   * 
   * - The `b-bind-|bind-` directive is a general directive used to bind data to an element property or attribute.
   * - The `b-model` directive is used to create a two-way data binding between an input value and a reactive property.
   * - The `b-mask` directive is used to format an input value using a mask.
   */
  ra,
  // [b-bind|bind]-[attributeName]
  fa,
  ua,
  /**
   * b-effect: used to create an effect that run when its dependencies change.
   * It is perfect for small expressions, reactive or not.
   * Example: console.log(`Hello, ${$data.name}!`)
   */
  Aa
], Ia = (e) => {
  P(Ra, (t) => G(e[$r], t)), e.masks.money = Ta, aa(e.maskTokens);
}, tr = "currentTime", lr = ee + "d", _a = {
  name: "Anime.js",
  // ? This validation can be improved
  validate: (e) => ["animatables", "autoplay"].every((t) => e.hasOwnProperty(t)),
  [ae]: (e, t) => {
    e[lr] && (e[He](), e[ee]()), e[tr] != e.duration ? e[ae]() : t();
  },
  [ee]: (e, t) => {
    e[lr] || (e[He](), e[ee]()), e[tr] != 0 ? e[ae]() : t();
  },
  onComplete: (e, t) => {
    e.complete = t;
  }
}, Hl = Bl + "Callback", Na = {
  name: "GSAP",
  // ? This validation can be improved
  validate: (e) => [Hl, "yoyo"].every((t) => t in e),
  [ae]: (e) => {
    e[ae]();
  },
  [ee]: (e) => {
    e[ee]();
  },
  [fl]: (e, t) => {
    e[Hl](fl, t), e[Hl]("onReverseComplete", t);
  }
}, Sa = (e) => {
  let t = e.effect;
  return t ? Number(t.getTiming().duration) : 0;
}, pa = {
  name: "Web Animations API",
  validate: (e) => e instanceof Animation,
  [ae]: (e, t) => {
    e.playbackRate < 0 && (e[ee](), e[He]()), e.currentTime != Sa(e) ? e[ae]() : t();
  },
  [ee]: (e, t) => {
    e.currentTime == 0 ? t() : e.playbackRate > 0 && (e[ee](), e[He]()), e.currentTime != 0 ? e[ae]() : t();
  },
  onComplete: (e, t) => {
    e.onfinish = t;
  }
};
export {
  _a as animeAnimationEngine,
  ra as bindDirective,
  bf as dataDirective,
  wf as eachDirective,
  Na as gsapAnimationEngine,
  Hf as htmlDirective,
  Vf as ifDirective,
  Pf as ignoreDirective,
  Jf as intersectionDirectives,
  ua as maskDirective,
  fa as modelDirective,
  Ta as moneyMask,
  ha as newApp,
  la as onDirective,
  $f as propsDirective,
  Zf as resizeDirectives,
  Bf as scriptDirective,
  Ia as setAllDirectives,
  aa as setDefaultMaskTokens,
  di as settings,
  Oa as setup,
  jf as showDirective,
  Gf as styleDirective,
  Wf as teleportDirective,
  Uf as templateDirective,
  Qf as transitionDirectives,
  xf as uidDirective,
  pa as webAnimationsApiAnimationEngine
};
