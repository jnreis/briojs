let $l = "brio", xt = "$", ke = "after", ri = "animation", si = "append", ct = "array", st = "attr", fi = "Attribute", w = "b-", Fe = "before", wl = "begin", os = "body", jt = "boolean", Ml = "both", us = "cache", rr = "can only be used on", sr = "Cannot ", Qe = "checkbox", tt = "checked", ys = "classList", gi = "closest", ai = "composi", fr = "Content", ft = "create", hl = "data", sl = "debounce", ar = "detail", nr = "define", M = "delete", xe = "directive", ml = "disconnect", Ul = "display", ni = "document", Er = "each", We = "element", Jt = "end", Ei = "Engine", Di = "entries", Fl = "error", je = "evalEffect", Bl = "event", cr = "EventListener", Tr = "exit", ci = "ctxArgs", Mt = "get", or = "head", $i = "href", Tt = "html", ur = "HTML", ot = "hydrate", yr = "in", Ar = "index", Il = "inner", mt = "insert", Rr = "Invalid", Kl = "length", St = "mask", As = "method", Sr = "must be", Oe = `
`, be = "newValue", dt = "name", Or = "Node", bt = "not found.", qe = null, ie = "number", Ut = "object", hr = "observe", Ct = "oldValue", Ti = "on-", wi = Ti + "enter", ki = Ti + Tr, bi = Ti + "resize", Ir = "once", fl = "onComplete", at = "onSet", _r = "operation", de = "options", Nr = "out", oi = "outer", Lt = "parent", Li = "patch", Me = "pause", ae = "play", Rs = "post", Ss = "prepend", pr = "prevent", dr = "Propert", ui = dr + "y", se = "props", Cr = "put", Hi = "radio", Ot = "remove", Pr = "replace", yi = "requires", ee = "reverse", Be = "route", Z = "script", Os = "Sibling", Ft = "skip", j = "select", ue = "state", gr = "start", Ai = "storage", Ue = "string", v = "style", Dr = "teleport", re = "template", oe = "text", xi = "throttle", Ri = "tion", $r = "toString", al = "tokens", Dt = "transition", wr = "type", ut, Yl = "update", kr = "validate", C = "value", br = "With", hs = "add" + cr, Gl = xt + hl, nl = xt + Er, Mi = xt + se, Ie = w + hl, zl = "b-if", Qt = "b-show", Is = us + "Exp", _s = "clone" + Or, El = ai + "ng", Ns = ai + Ri + gr, ps = ai + Ri + Jt, ds = ft + "Element", Wl = nr + ui, Cs = nr + dr + "ies", Lr = "de" + ot, mi = M + ui, Hr = xe + "s", _l = "func" + Ri, Ps = Mt + fi, Ui = or + "ers", Q = Il + ur, K = "in" + Cr, gs = mt + "AdjacentHTML", ql = St + "s", xr = St + "Token", Vl = xr + "s", Ds = "next" + Os, $s = "of " + wr, Pt = oi + ur, Mr = "Own" + ui, ws = Lt + Or, kl = "path" + dt, ks = pr + "Default", mr = "proto" + wr, bs = Ot + fi, Ls = Ot + cr, cl = Pr + br, Fi = Be + "Rule", bl = j + "ionStart", Hs = "set" + fi, xs = gr + "s" + br, Ms = Ai + "Area", Tl = "tar" + Mt, lt = oe + "area", Ke = oe + fr, ms = "async" + _l, Ur = Mt + Mr + "Descriptor", Us = Ur + "s", Fs = "has" + Mr, Fr = (e, t, l, i) => `the ${e} ${t} ${yi} ${l}, ` + Br(i), Br = (e) => `but got ${e} instead.`, G = (e, t) => e.push(t), Si = (e, t) => e.sort(t), Bs = (e) => e[ee](), _e = (e, t) => e.join(t), g = (e, t) => e.forEach(t), Ae = (e, t, l) => e.map(t, l), nt = (e, t, l) => e.filter(t, l), Kr = (e, t, l) => e.find(t, l), Oi = (e, t, l) => e.every(t, l), Yr = (e, t, l) => e.findIndex(t, l), Gr = (e, t, l) => e.indexOf(t, l), zr = (e, t) => t[1] - e[1], ht = (e) => Array.from(e), Ks = (e, t = 0) => Ae(ht({ [Kl]: e }), (l, i) => t + i), Ys = (e, t) => e[$r](t), W = (e) => e.trim(), Ce = (e) => e.toLowerCase(), q = (e, t, l) => e.split(t, l), hi = (e, t) => e.match(t), Ye = (e, t, l) => e[xs](t, l), me = (e, t) => t.test(e), fe = (e, t, l) => e[Pr](t, l), Gs = (e) => me(e, /^\d+$/), zs = (e) => me(e, /^(\w|\s|\.|\$|`|'|"|(\[(.|\s)+?\]))*;?$/g) && !Ye(e, M + " "), Wr = (e) => me(W(e), /^((async\s+)?function\s*\([^)]*\)\s*{[^}]*}|(async\s*)?(?:\([^()]*\)|[$\w]+)\s*=>)/), qr = (e) => JSON.stringify(e), Ii = (e, t) => {
  try {
    e = JSON.parse(e, t);
  } catch {
  }
  return e;
}, Ws = (e) => {
  let t = Ys(new URLSearchParams(e));
  return t ? "?" + t : "";
}, _i = (e) => "`" + fe(e, /`/g, "\\`") + "`", Ht = (e) => Ce(ce(Se[mr][$r].call(e), 8, -1)), Je = (e, t) => Ht(e) === t, Ne = (e) => e === qe, Ve = (e) => e === ut, It = (e) => Je(e, Ut), Re = (e) => Je(e, ct), Bt = (e) => qs(e) || Vs(e), qs = (e) => Je(e, _l), Vs = (e) => Je(e, ms), Xe = (e) => Je(e, Ue), Vr = (e) => Je(e, ie) && isFinite(e), Xs = (e) => Je(e, jt), js = (e) => Nl(e, Xr), Nl = (e, t) => e instanceof t, yt = (e) => Nl(e, Node), Js = (e) => Nl(e, Text), $t = (e) => Nl(e, HTMLElement), we = window, Se = Object, Ze = Reflect, Zt = location, Kt = we[ni], Xr = RegExp, J = (e, t, l) => It(e) && t in e ? e[t] : l, Qs = (e) => {
  let t = ul();
  for (; t in e; ) t = ul(12);
  return t;
}, wt = (e) => Y(ne(e)), Zs = (e, ...t) => {
  g(t, ([l, i]) => {
    l in e && (e[i] = e[l], Yt(e, l));
  });
}, ne = (e) => Se.keys(e), vs = (e = qe) => Se[ft](e), ef = (e, t = {}) => {
  const l = vs(e);
  return Se[Cs](
    l,
    Se[Us](t)
  ), l;
}, tf = (e, t, l = Se) => l[Ur](e, t), lf = (e) => Se.getPrototypeOf(e), At = (e, t) => Se[mr][Fs].call(e, t), Ee = (e, t, l = {}) => {
  Zs(l, ["v", C], ["w", "writable"], ["e", "enumerable"], ["c", "configurable"]), Se[Wl](e, t, l);
}, jr = (e, t = {}) => {
  g(ne(e), (l) => {
    Ee(e, l, t);
  });
}, Yt = (e, t) => delete e[t], rf = (e) => g(ne(e), (t) => {
  Yt(e, t);
}), Pe = () => /* @__PURE__ */ new Map(), sf = (e, t) => new Xr(e, t), F = (e, t, l) => e.includes(t, l), Ni = (e) => It(e) ? Se[Di](e) : e[Di](), ce = (e, t, l) => e.slice(t, l), Y = (e) => Ve(e[Kl]) ? e.size : e[Kl], ge = (e, t = 0) => setTimeout(e, t), ol = (e, t) => {
  let l;
  return (...i) => {
    clearTimeout(l), l = ge(() => e(...i), t);
  };
}, ff = (e, t) => {
  let l = 0;
  return (...i) => {
    let s = Date.now();
    if (!(s - l < t))
      return l = s, e(...i);
  };
}, af = () => crypto.randomUUID(), ul = (e = 8) => "b" + ce(fe(af(), /-/g, ""), 0, e - 1), Jr = (e, ...t) => console[e]("Brio.js", ...t), Qr = (...e) => Jr("warn", "warn:", ...e), H = (...e) => Jr(Fl, `detected an ${Fl}:`, ...e), Rt = (e, t = Kt) => ht(t.querySelectorAll(e)), B = (e, t = Kt) => Xe(e) ? Rt(e, t)[0] : e, Te = (e, t, ...l) => e[t](...l), nf = (e, t, l) => {
  t == Q || t == Pt ? e[t] = l : e[gs](t, l);
}, Ef = (e, t, l) => {
  l && te(l) ? Te(l, Fe, e) : Te(t, si, e);
}, cf = (e) => e[_s](!0), Bi = (e) => {
  let t = te(e);
  if (t) {
    let l = ye(t), i = Gr(l, e), s = Bs(ce(l, 0, i)), n = ce(l, i + 1);
    return () => {
      let a = !1;
      for (let E of n)
        if (te(E) == t) {
          Te(E, Fe, e), a = !0;
          break;
        }
      if (!a) {
        for (let E of s)
          if (te(E) == t) {
            Te(E, ke, e), a = !0;
            break;
          }
      }
      a || Te(t, si, e);
    };
  }
}, Xl = (e, t) => g(ht(e.attributes), ({ name: l, value: i }) => t(l, i)), yl = (e) => e[Ot](), te = (e) => e[ws], Tf = (e) => e[Ds], Zr = (e) => W(e[Ke] || ""), ye = (e) => [...e.childNodes], z = (e, t) => e[Ps](t), pl = (e, t, l, i) => {
  i && (e[i] = l), e[Hs](t, l);
}, dl = (e, t) => e[bs](t), pi = (e, t) => Kt[ds](e, t), of = (e) => new DOMParser().parseFromString(e, oe + "/" + Tt), pe = (e) => Ce(e.tagName || ""), he = (e, t, l, i) => (Xe(e) && (e = B(e)), e[hs](t, l, i), () => e[Ls](t, l)), Ge = (e, t, l) => B(e).dispatchEvent(new CustomEvent(Ce(fe(t, /[^a-z\d]/gi, "")), {
  bubbles: !0,
  cancelable: !0,
  [ar]: l
})), jl = async (e, t) => {
  if (await t(e))
    for (let l of ye(e))
      await jl(l, t);
}, uf = (e) => e[Tl][El] = !0, yf = (e) => {
  let t = e[Tl];
  t[El] && (t[El] = !1, Ge(t, K));
}, vr = (e) => we.getComputedStyle(e), Af = (e) => {
  let t = vr(e);
  return !(!te(e) || t[Ul] == "none" || t.visibility == "hidden" || t.opacity == "0");
}, Rf = (e, t) => new URL(e, t), vt = (e = "", t = $i) => Rf(e, Zt[$i])[t], es = (e) => F(["src", C, tt, j + "ed"], e), Ki = (e, t = "") => `:not([${e}]${t})`, Sf = (e, t, l) => async (i, s, n, a) => {
  let E = s == oi ? Pt : s == Il ? Q : s == oe ? Ke : s == Fe ? Fe + wl : s == "first" ? ke + wl : s == "last" ? Fe + Jt : s == ke ? ke + Jt : s, r = "$dom." + mt, f = B(n), c = B(or), o = B(os);
  if (!f) return H(r, We, bt);
  (c == f || o == f) && (E = Q);
  let y = B(Tt) == f, h = E == Ke, D = h || E == Q, R = E == Pt, N = D ? f : te(f);
  if (!N && !y) return H(r, Lt, We, bt);
  i = await i, i in l && (i = l[i]());
  let p = yt(i) ? i : of(i), L = J(a, j);
  L && (i = B(L, p)), yt(i) && (i = i[Pt]), (R || y) && t(f, !1), D && g(ye(f), (O) => t(O));
  let m = new Set(ye(f));
  N && g(ye(N), (O) => m.add(O));
  let le = (O) => nt(ye(O), ($) => !m.has($)), x = [];
  y ? (f[Q] = B(Tt, p)[Q], x = [f, ...Rt(Z, f)]) : D ? (f[h ? Ke : Q] = i, x = ye(f)) : R ? (f[Pt] = i, x = le(N)) : (nf(f, E, i), x = le(E == Fe + wl || E == ke + Jt ? N : f)), Si(x, (O, $) => {
    let P = pe(O) == v, I = pe($) == v;
    return P && !I ? -1 : I && !P ? 1 : 0;
  }), g(x, (O) => {
    if (
      // is script element
      pe(O) == Z && // is not b-script
      Ne(z(O, w + Z)) && // should load: !(b-load-once attribute AND script already loaded)
      !(!Ne(z(O, "b-load-" + Ir)) && as.has(z(O, "src")))
    ) {
      let $ = pi(Z);
      Xl(O, (P, I) => pl($, P, I, es(P) && P)), $[Q] = O[Q], Te(O, cl, $);
    }
  }), J(a, ot, !0) && g(x, (O) => e(O, f));
}, Nt = (e) => async (t, l, i = {}) => {
  let s = "status", n = fr + "-Type", a = "application/json", E = J(i, "parser");
  if (It(l)) {
    let r = i[Ui] || {}, f = Kr(ne(r), (o) => Ce(o) == Ce(n)), c = r[f];
    e == Mt || e == M && !f ? (t += Ws(l), l = ut) : (!f || c == a) && (l = qr(l), f || (r[n] = a, i[Ui] = r));
  }
  try {
    let r = await fetch(t, { ...i, [As]: e, body: l });
    if (!r.ok) {
      let c = new Error(`HTTP ${Fl}! ${s}: ${r[s]}`);
      throw c.response = r, c;
    }
    let f = await r[E || oe]();
    if (!E)
      try {
        f = Ii(f);
      } catch {
      }
    return f;
  } catch (r) {
    throw r;
  }
}, Al = {
  get: Nt(Mt),
  post: Nt(Rs),
  put: Nt(Cr),
  [Li]: Nt(Li),
  [M]: Nt(M)
}, Of = (e, t, l) => [
  // Set a route
  (i, s) => {
    if (Bt(s)) {
      i = vt(i, kl);
      let n = nt(q(i, "/"), W), a = Y(n) - 1, E = e;
      g(n, (r, f) => {
        r in E || (E[r] = {}), E = E[r], f == a && (E[gt] = s);
      });
    } else H(sr, "set route without a", Be, _l, Oe, i);
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
    if (!Ye(vt(i), Zt.origin))
      return Zt.href = i, qe;
    i = vt(i, kl);
    let s = nt(q(i, "/"), W), n = e, a = {}, E = 0;
    for (let r of s) {
      if (E = 0, r in n && !Ye(r, ":"))
        n = n[r], E = 1;
      else for (let f of ne(n))
        if (Ye(f, ":")) {
          let [c, o] = nt(q(f, ":"), W);
          if (!o || o && o in t && t[o](r)) {
            let y = a[c];
            y ? Re(y) ? G(y, r) : a[c] = [y, r] : a[c] = r, n = n[f], E = 1;
            break;
          }
        }
      if (!E) break;
    }
    return E = E && n[gt] ? 1 : 0, E ? n[gt]({
      params: a,
      path: i,
      [Ot]: () => Yt(n, gt)
    }) : l(Al.get(i), oi, Tt), i != Zt[kl] && history.pushState(qe, "", i), !!E;
  }
], el = [], hf = () => {
  let e = Pe(), t = (l, i) => {
    let s = el.find((n) => n[kr](l));
    if (s)
      return e.has(l) || s[fl](l, () => {
        e.get(l)();
      }), e.set(l, i), s;
    H(ri, Ce(Ei), bt, Oe, l);
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
      let n = J(s, ae, () => {
      }), a = J(s, Me, () => {
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
    (l, i = !0, s) => {
      let n = J(s, ae, () => {
      }), a = J(s, Me, () => {
      }), E = t(l, n);
      E && i ? (a(), E[ee](l, n)) : n();
    }
  ];
}, If = (e) => {
  if (!e || !Oi([dt, kr, ae, ee, fl], (t) => t in e))
    H(Rr, ri, Ce(Ei), e ? e[dt] : "");
  else {
    let t = Yr(el, (l) => l[dt] == e[dt]);
    t >= 0 ? el[t] = e : G(el, e);
  }
}, _f = (e) => {
  let t = ({ prop: l }, i) => (ze[M](t), i[Ft].add(l), e);
  return ze.add(t), t;
}, Jl = !1, Ql = [], ts = (e) => (Ql = [], Jl = !0, e({}), Jl = !1, [...Ql]), Nf = (e) => {
  let t = ts(e), l = [];
  for (let s of t) {
    let n = Y(l) - 1, a = l[n];
    a && a[0][a[1]] === s[0] ? l[n] = s : G(l, s);
  }
  l = l.filter((s) => s[1] in s[0]).filter(([s, n], a, E) => Yr(E, ([r, f]) => s === r && n == f) == a);
  let i;
  if (Y(l) == 1) {
    let [s, n] = l[0];
    i = (a) => Ve(a) ? s[n] : s[n] = a;
  }
  return i;
}, De = (e, t) => {
  if (!Yi(e) || Le(e)) return e;
  let l = J(t, Lt, qe);
  t = { [Lt]: l };
  let i = {
    get(E, r) {
      return Jl && (At(E, r) || !(r in E)) && G(Ql, [s, r]), Ze.get(E, r, s);
    },
    set(E, r, f) {
      r in E || Ee(E, r, { w: !0, e: !0, c: !0 });
      let c = s[r];
      if (c === f) return !0;
      let o = it(s);
      ze.has(f) && (f = f({ [ue]: s, prop: r, [be]: f, [Ct]: c }, o, f)), n.has(r) || (f = De(f)), Le(c) && Le(f) && (kt.set(f, it(c)), kt[M](c));
      let y = Ze.set(E, r, f, s);
      return o[at][r] && g(o[at][r], (h) => h({ [ue]: s, prop: r, [be]: f, [Ct]: c }, o, h)), Gi(o, s, r, f, c), y;
    },
    [mi](E, r) {
      let f = E[r], c = Ze[mi](E, r);
      return Gi(it(s), s, r, ut, f), c;
    },
    [Wl](E, r, f) {
      let c = f[C], o = s[r];
      return ze.has(c) && (f[C] = c({ [ue]: s, prop: r, [be]: c, [Ct]: o }, it(s), c)), !n.has(r) && C in f && (f[C] = De(f[C])), Ze[Wl](E, r, f);
    }
  };
  const s = new Proxy(Le(l) ? ef(l, e) : e, i), n = /* @__PURE__ */ new Set();
  let a = {
    [ue]: Pe(),
    [se]: {},
    skip: n,
    [at]: {}
  };
  kt.set(s, a);
  for (let E in e) {
    let r = e[E];
    ze.has(r) ? (r = r({ [ue]: s, prop: E, [be]: r, [Ct]: ut }, a, r), Ze.set(e, E, r, s)) : !n.has(E) && Yi(r) && Ze.set(e, E, r, s);
  }
  return s;
}, Yi = (e) => Re(e) || It(e), Gi = (e, t, l, i, s) => {
  let n = Ve(s) ? ft : Ve(i) ? M : Yl, a = {
    [_r]: n,
    [ue]: t,
    prop: l,
    [be]: i,
    [Ct]: s
  };
  zi(e[ue], a), e[se][l] && zi(e[se][l], a);
}, zi = async (e, t) => {
  let l = ht(e);
  Si(l, zr);
  for (let [i] of l) await i(t);
}, pf = (e, t, l) => {
  e[at][t] || (e[at][t] = /* @__PURE__ */ new Set()), e[at][t].add(l);
}, ls = "getItem", is = "setItem", Zl = Pe(), df = (e) => {
  let t = lf(e);
  return t && At(t, ls) && At(t, is);
}, vl = (e, t) => Ii(e[ls](t) || ""), Wi = (e, t, l) => e[is](t, qr(l)), qi = (e) => "_b_" + e, rs = (e, t, l) => {
  if (!df(e))
    return H(Rr, Ai, Ut);
  l && (l = qi(l), At(e, l) && (t = vl(e, l)));
  let i = ({ state: s, prop: n }, a) => {
    ze[M](i), Zl.set(l, [s, n, e]), l = l || qi(n), At(e, l) ? t = vl(e, l) : Wi(e, l, t);
    let E = () => Wi(e, l, s[n]);
    return ge(() => Et(s, n, E)), pf(a, n, ({ state: r, prop: f }) => {
      Le(r[f]) && Et(r[f], "", E);
    }), t;
  };
  return ze.add(i), i;
}, Cf = (e) => {
  if (Zl.has(e.key)) {
    let [t, l, i] = Zl.get(e.key);
    i === e[Ms] && (t[l] = vl(i, e.key));
  }
}, tl = (e, t, l = 0) => {
  let i = [], s = ts(t || e);
  return g(s, ([n, a]) => {
    G(i, fs(n, a, e, l));
  }), t && e({}), () => g(i, (n) => n());
}, Et = (e, t, l, i = 0) => (
  // If the proxied object is not an observed state, log an error and return an empty function
  !Le(e) && !H(sr + `watch non-${ue} ${Ut}/${ct}.`) ? () => {
  } : At(e, t) ? fs(e, t, l, i) : ss(e, l, i)
), kt = Pe(), ze = /* @__PURE__ */ new Set(), Le = (e) => kt.has(e), it = (e) => kt.get(e), ss = (e, t, l = 0) => {
  if (Le(e)) {
    let i = it(e)[ue];
    return i.set(t, l), () => i[M](t);
  }
}, fs = (e, t, l, i = 0) => {
  let s = it(e)[se];
  s[t] || (s[t] = Pe()), s[t].set(l, i);
  let n = ss(e[t], l, i);
  return () => {
    s[t][M](l), n && n();
  };
};
Ee(De, "persist", { v: (e, t) => rs(localStorage, e, t) });
Ee(De, "session", { v: (e, t) => rs(sessionStorage, e, t) });
Ee(De, Ft, { v: _f });
let Rl = (e, t, l = !0) => new Function(e, l ? `return(${t})` : t), Pf = (e, t) => t ? _i(e) : rt(e), Cl = (e, t = "", l = !0) => (zs(e) && !l && (e += `(${t})`), Wr(e) || (e = Pf(e, l == oe), e = `(${t})=>` + (l ? `(${e})` : `{${e}}`)), e), Vi = (e, t, l) => {
  let i = e.get(t);
  return i && i[l];
}, gf = (e) => [
  // Adds a hook to a target
  (t, l, i, s = 0) => {
    Bt(i) && (e.has(t) || e.set(t, {}), e.get(t)[l] || (e.get(t)[l] = Pe()), Vi(e, t, l).set(i, s));
  },
  // Calls all the functions under a hook name on a target by priority
  async (t, l, i) => {
    let s = Vi(e, t, l);
    if (s && Y(s)) {
      let n = ht(s);
      Si(n, zr);
      let a = -1, E = !0, r = async () => {
        if (a++, E = !0, a < Y(n)) {
          let f = a;
          await n[f][0](
            /** Contextual data, if any */
            i,
            {
              /** Call the next function */
              play: r,
              /** Disable the auto-run feature and choose when/if to call the next function */
              [Me]: () => E = !1,
              /** Remove the current function */
              [Ot]: () => s[M](n[f][0])
            }
          ), E && await r();
        }
      };
      await r();
    }
  }
], gt = Symbol(), di = {}, as = /* @__PURE__ */ new Set(), Ia = () => {
  let e = (T) => h.get(T), t = (T, A = () => !0) => {
    let u = T ? te(T) : qe;
    for (; u; ) {
      let S = e(u);
      if (S && wt(S[st]) && A(S)) return S;
      u = te(u);
    }
  }, l = (T, A) => {
    let u = e(T);
    if (!u) {
      let S = A ? e(A) : t(A || T);
      u = {
        // Local context
        // @ts-ignore
        ctx: { ...Gt },
        // A reference to the element. Convenience for internal use.
        el: T,
        // UID context
        uid: J(S, "uid", {}),
        /** Attributes or directives */
        attr: {},
        /** Cleanup functions */
        cFns: [],
        ...gl,
        ..._t
      };
      for (let d in x) {
        let k = x[d](u, S);
        k && Ee(u.ctx, d, { v: k, e: !0 });
      }
      h.set(T, u);
    }
    return u;
  }, i = (T, A, u, S) => {
    let d = T.el;
    O(d, A, S(d));
    let k = y(T, u);
    V(T, tl(() => $(d, A, k)));
  }, s = (T, A) => {
    Xe(T) && (T = B(T)), Xe(A) && (A = B(A)), yt(A) || (A = ut), yt(T) && (f(T), jl(T, async (u) => {
      let S = !1, d = T == u ? A : ut;
      if (Js(u) && Zr(u))
        S = a(u, d);
      else if ($t(u))
        if (pe(u) == re) {
          let b = pi("div");
          Xl(u, ($e, zt) => pl(b, $e, zt)), b[Q] = u[Q], Te(u, cl, b), s(b, d), ge(() => Te(b, cl, ...ye(b)));
        } else
          S = await E(u, d);
      return S;
    }));
  }, n = (T, A = !0, u = !0) => {
    jl(T, (S) => {
      let d = e(S);
      return d && (g(d.cFns, (k) => k()), u && h[M](S), A && yl(S)), !0;
    });
  }, a = (T, A) => {
    let u = T[Ke], S = ns(rt(u || ""));
    if (S && me(S, il)) {
      let d = l(T, A), k = y(d, `$el.${Ke}=${_i(S)}`, "", !1);
      V(d, tl(k)), ll(d, oe, u);
    }
    return !1;
  }, E = async (T, A) => {
    let u = l(T, A);
    if (!Ve(pt(u))) return !0;
    u[de] = r(u, w + de)();
    for (let [S, d] of R) {
      let k = [];
      if (js(S))
        Xl(T, (b, $e) => {
          me(b, S) && G(k, [b, $e]);
        });
      else {
        let b = z(T, S);
        Ne(b) || G(k, [S, b]);
      }
      for (let [b, $e] of k) {
        if (pt(u)) break;
        ll(u, b, $e), await d(u, b, rt($e));
      }
      if (pt(u)) break;
    }
    return Ve(pt(u)) && (u.skip = !1), !wt(u[st]) && !A && h[M](T), !pt(u);
  }, r = (T, A, u = "{}") => {
    let S = rt(z(T.el, A) || u);
    return ll(T, A, S), y(T, S);
  }, f = (T) => {
    let A = w + "save";
    if ($t(T)) {
      let u = Rt(re + `,[${A}]`, T);
      (z(T, A) || pe(T) == re) && G(u, T), g(u, (S) => {
        let d = z(S, A);
        dl(S, A);
        let k = pe(S);
        if (k == re && g(ye(S.content), (b) => f(b)), d) {
          let b = k == Z, $e = b ? Z : k == v ? v : re, zt = S[Q];
          _t[$e][d] = b ? Rl(Dl, rt(zt), !1) : zt, Ne(z(S, w + ot)) && yl(S);
        }
      });
    }
  }, c = (T) => (A, u) => {
    _t[T][A] = u;
  }, o = (T, A = "", u = !0) => {
    let S;
    return T = Cl(T, A, u), T in le ? S = le[T] : (S = Qs(m), m[S] = Rl(Dl, T), le[T] = S), S;
  }, y = (T, A, u = "", S = !0) => {
    let d;
    try {
      let k = A in m ? A : o(A, u, S);
      d = m[k](T.ctx);
    } catch (k) {
      H(k.message), d = () => gt;
    }
    return d;
  }, h = Pe(), D = Pe(), R = [], N = {}, p = {}, L = { [ie]: Gs }, m = {}, le = {}, x = {
    // The element itself
    $el: (T) => T.el,
    // References to `b-ref` elements under the same $data context, not including nested $data contexts
    $refs: (T, A) => !A || $t(T.el) && !Ne(z(T.el, Ie)) ? {} : A.ctx.$refs,
    // Unique identifier for the element
    $uid: (T) => (A) => `${A}-${T.uid[A]}`,
    // Reactive properties defined in the element or inherited from the parent context
    [Mi]: Xi(Mi, w + se, !0),
    // The $data context
    [Gl]: Xi(Gl, Ie),
    // The $each context
    [nl]: (T, A) => A == null ? void 0 : A.ctx[nl]
  }, [O, $] = gf(D), P = Sf(s, n, N), [I, _] = Of(p, L, P);
  di[Be] || ji(_);
  let U = ri + Ei, X = {
    hook: O,
    [Be]: I,
    router: ji,
    [Fi]: c(Fi + "s"),
    [re]: c(re),
    [v]: c(v),
    [Z]: c(Z),
    [se]: c(se),
    data: c(hl),
    mask: c(ql),
    [xr]: c(Vl),
    [U]: If
  }, gl = {
    [ot]: s,
    [Lr]: n,
    [mt]: P,
    [Be]: _,
    emit: Ge,
    listen: he,
    query: B,
    queryAll: Rt,
    /** Get the closest parent element of a target element that has a directive (b-data by default) */
    [gi](T, A = Ie) {
      let u = t(B(T), (S) => A in S[st]);
      return u || H(gi + ":", We, bt), u == null ? void 0 : u.el;
    },
    /** Get the local context of an element */
    context: (T) => {
      var A;
      return (A = e(B(T))) == null ? void 0 : A.ctx;
    }
  }, Gt = {
    $dom: gl,
    $http: Al,
    $set: X,
    $store: De({}),
    $state: De,
    $watch: Et,
    $effect: tl
  }, Dl, Pi = () => Dl = `{${_e(ne(Gt))},${_e(ne(x))}}`;
  Pi();
  let _t = {
    [re]: N,
    [v]: {},
    [Z]: {},
    [se]: {},
    data: {},
    // ! HYDRATION
    lcFns: x,
    [Hr]: R,
    vnodes: h,
    hooks: D,
    [ql]: {},
    [Vl]: {},
    routes: p,
    routeRules: L,
    // ! PUBLIC CONTEXT
    gc: Gt,
    // ! TOOLS
    exec: y,
    [Is]: o,
    [ci]: Pi,
    [je]: i,
    vnode: [l, e],
    hook: [O, $],
    [Dt]: hf()
    // insert,
    // route: [SetRoute, Route],
  };
  return g([X, gl, Al, Gt, _t], (T) => jr(T, { w: !1, c: !1 })), _t;
}, pt = (e) => e.skip, V = (e, t) => {
  G(e.cFns, t);
}, ll = (e, t, l) => {
  e[st][t] = l, $t(e.el) && dl(e.el, t);
}, rt = (e) => fe(W(_e(Ae(q(e, Oe), (t) => Ye(W(t), "//") ? "" : t), Oe)), /;$/, ""), il = /\${((?!.*\${).*?)}/, ns = (e) => {
  let t = /{{((?!.*{{).*?)}}/;
  for (; me(e, t); )
    e = fe(e, t, "${$1}");
  return e;
}, Xi = (e, t, l) => (i, s) => {
  let n = i.el, a = s ? s.ctx[e] : qe, E = $t(n), r = E && !Ne(z(n, t)), f = E && (!a || r);
  return f && !r && t == Ie && pl(n, Ie, ""), f ? De({}, { [Lt]: l && a }) : a || {};
}, ji = (e) => {
  Bt(e) && (di[Be] = () => e(vt()));
}, _a = (e = {}) => {
  $l in we || (jr(e, { w: !1, c: !1 }), Ee(we, $l, { v: e }), he(we, Ai, Cf), he(we, "pop" + ue, di[Be]), Ge(we, $l));
}, Pl = (e, t) => ce(e, Ye(e, w) ? t : t - 2), Df = async (e, t, l) => {
  e[Ft] = !l || !!await e.exec(e, l)();
}, $f = ["b-ignore", Df], wf = (e, t, l) => {
  let i = e.el, [s, n] = e.vnode, [a, E] = e.hook;
  e[Ft] = !0;
  let [r, f] = Ae(q(l, " in "), W), [c, o] = Ae(q(r, ","), W);
  o || (o = Ar);
  let y = `the ${t} ${xe} ` + yi;
  if (!Ji(c) || !Ji(o))
    return H(y, "a valid alias.");
  let h = e.exec(e, f)(), D = Le(h);
  if (Vr(h) && (h = Ks(h, 1)), !(Re(h) || It(h)))
    return H(y, `an ${ct}, ${Ut}, or ${ie}.`);
  let R = Tf(i), N = te(i);
  yl(i);
  let p = {}, L = t + "-" + ft, m = t + "-" + Yl, le = t + "-" + M;
  a(i, L, ([O, $]) => {
    let P = cf(i);
    Ef(P, N, R);
    let I = s(P);
    ll(I, "", "");
    let _ = De({});
    Ee(_, c, { v: $, w: !0, e: !0 }), Ee(_, o, { v: O, w: !0, e: !0 }), Ee(I.ctx, nl, { v: _, e: !0 }), V(I, Et(_, o, ({ [be]: U }) => {
      let X = p[O][1];
      U !== X && (_[o] = X);
    })), D && V(I, Et(_, c, ({ [be]: U }) => {
      h[_[o]] = U;
    })), p[O] = [P, O], e[ot](P);
  }), a(i, m, ([O, $]) => {
    let P = p[O], I = n(P && P[0]);
    if (I) {
      let _ = I.ctx[nl];
      _[c] = $, _[o] = O, P[1] = O;
    }
  }), a(i, le, ([O, $]) => {
    let [P] = p[O];
    e[Lr](P), Yt(p, O);
  });
  let x = {
    [ft]: (O) => E(i, L, O),
    [Yl]: (O) => E(i, m, O),
    [M]: (O) => E(i, le, O)
  };
  for (let O of Ni(h))
    x[ft](O);
  D && V(e, Et(h, "", ({ [_r]: O, prop: $, [be]: P }) => {
    x[O]([$, P]);
  }));
}, Ji = (e) => me(e, /^[a-z_$][\w$]*$/i), kf = [w + Er, wf], bf = async (e, t) => {
  let [l, i] = e.hook, s = e.el;
  l(s, t, () => {
    let n = e.ctx.$refs, a = ` [${t}]`, E = Rt(a + Ki(Ie) + Ki(Ie, a), s);
    g([s, ...E], (r) => {
      let f = z(r, t);
      if (f) {
        let c = n[f];
        c ? Re(c) ? G(c, r) : n[f] = [c, r] : n[f] = r, dl(r, t);
      }
    });
  }), await i(s, t);
}, Es = async (e, t, l) => {
  let [i, s] = e.hook, n = t == Ie, a = n ? hl : se, E = e[a], r = l ? E[l] || Rl(e[ci](), l) : () => ({}), f = e.ctx[xt + a];
  i(e.el, t, async () => {
    let c = await r(e.ctx);
    if (!It(c))
      return e[Ft] = !0, H(Fr(xe, t, "an " + Ut, Ht(c)));
    for (let o in c) Ee(f, o, tf(c, o));
    n && await bf(e, "b-ref");
  }), await s(e.el, t, f);
}, Lf = [w + se, Es], Hf = [Ie, Es], Wt = {}, xf = async (e, t, l) => {
  if (l) {
    let i = e.el, [s, n] = e.hook;
    s(i, t, () => {
      let a = e.exec(e, l)();
      if (!Re(a) || !Oi(a, Xe))
        return H("the", t, xe, Sr, `an ${ct} of ${Ue}(s).`);
      e.uid = a.reduce((E, r) => (r in Wt ? Wt[r]++ : Wt[r] = 1, E[r] = Wt[r], E), {});
    }), await n(i, t);
  }
}, Mf = ["b-uid", xf], cs = (e) => (t, l, i) => {
  let s = t[re];
  i in s && (i = _i(s[i] || i)), i && t[je](t, l, i, (n) => async (a) => {
    await t[mt](a(), e, n);
  });
}, mf = [w + Tt, cs(Il)], Uf = [w + oe, cs(oe)], Ff = (e, t, l) => {
  let i = e.el, s = e[re][l] || e.exec(e, l)(), [n, a] = e.hook;
  n(i, t, async () => {
    await e[mt](s, Il, i), Te(i, cl, ...ye(i));
  }), a(i, t);
}, Bf = [w + re, Ff], Kf = async (e, t, l) => {
  let i = e.el, s = e[Z], n = pe(i) == Z;
  e.skip = n;
  let [a, E] = e.hook, r = l ? s[l] || e.exec(e, l)() : [];
  r = Ae(
    Re(r) ? r : [r],
    (f) => s[f] || f
  ), a(i, t, async () => {
    if (n) {
      let f = z(i, "src");
      f && as.add(f);
      let c = f ? await Al.get(f) : Zr(i);
      c && G(r, rt(c)), yl(i);
    }
    for (let f of r) {
      let c = f;
      if (Xe(c)) {
        let o = Wr(c);
        c = Rl(e[ci](), c, o), o && (c = c(e.ctx));
      }
      Bt(c) && await c(e.ctx);
    }
  }), await E(i, t);
}, Yf = [w + Z, Kf], Gf = (e, t, l) => {
  let i = e.el;
  if (l && pe(i) != v) {
    let [s, n] = e.hook, a = e[v], E = a[l] || e.exec(e, l)();
    E = Ae(
      Re(E) ? E : [E],
      (f) => a[f] || f
    );
    let r = ul();
    s(i, t, () => {
      i[ys].add(r);
      let f = pi(v);
      f[Ke] = zf(_e(E, Oe), "." + r), e[ot](f, i), Te(i, ke, f);
    }), n(i, t, r);
  }
}, zf = (e, t) => {
  e = fe(e, /\/\*[\s\S]*?\*\//g, ""), e = ns(e);
  let l = [], i = ul();
  for (; me(e, il); ) {
    let r = hi(e, il);
    r && (G(l, r[0]), e = fe(e, il, i));
  }
  let s = nt(q(e, "}"), W), n = Oe + "    ", E = _e(Ae(s, (r) => {
    let [f, c] = q(r, "{"), o = Ae(
      Ae(q(f, ","), W),
      (y) => F(y, "&") ? fe(y, /&/g, t) : t + " " + y
    );
    return c = _e(Ae(nt(q(c || "", Oe), W), W), n), _e(o, ",") + ` {${n + c + Oe}}`;
  }), Oe);
  return g(l, (r) => {
    E = fe(E, i, r);
  }), E;
}, Wf = [w + v, Gf], qf = (e, t, l) => {
  let i, s;
  try {
    i = B(l), yt(i) && (l = Cl(l, "", oe));
  } catch {
  }
  e[je](e, t, l, (n) => (a) => {
    try {
      let E = a();
      Re(E) ? [i, s] = E : i = B(E);
    } catch {
    }
    F([Fe, ke, Ss, si], s) || (s = ke), yt(i) ? Te(i, s, n) : Qr(Dr, We, bt, t + `="${l}"`);
  });
}, Vf = [w + Dr, qf], Xf = (e, t, l) => {
  e[je](e, t, l, (i) => {
    let s = te(i), n = Bi(i);
    return (a) => {
      let E = a();
      ge(() => {
        if (E) n();
        else {
          let r = te(i);
          r && (r != s && (s = r, n = Bi(i)), i[Ot]());
        }
      });
    };
  });
}, jf = [zl, Xf], Jf = (e, t, l) => {
  let i = vr(e.el)[Ul];
  i == "none" && (i = "block"), e[je](e, t, l, (s) => (n) => {
    let a = n();
    te(s) && ge(() => {
      s[v][Ul] = a ? i : "none";
    });
  });
}, Qf = [Qt, Jf], Qi = 1 / 0, Ll = (e) => (t, l, i) => {
  let s = t[st][zl] ? zl : t[st][Qt] ? Qt : "";
  if (!s)
    return H("the", l, xe, Sr, "accompanied by an b-if or", Qt, xe);
  let [n] = t.hook, [a, E] = t[Dt], r = t.exec(t, i)();
  r[Me](), (e == Nr || e == Ml) && n(t.el, s, (f, c) => a(r, f, c), Qi), (e == yr || e == Ml) && n(t.el, s, (f, c) => E(r, f, c), -Qi);
}, Zf = [
  [w + Dt, Ll(Ml)],
  [w + Dt + "-in", Ll(yr)],
  [w + Dt + "-out", Ll(Nr)]
], qt = (e, t, l) => {
  let [i, s] = e.hook, n = Pl(t, 5), [a] = q(n, "-"), E = e[de][t] || {}, r = e.el, f = e.exec(e, l, "$entry", !1);
  i(r, t, ol(f, E[sl] || 100));
  let c = new IntersectionObserver((o) => {
    g(o, async (y) => {
      y.isIntersecting != (a == Tr) && (await s(r, t, y), E[Ir] && c[ml]());
    });
  }, E);
  c[hr](r), V(e, () => c[ml]());
}, vf = [
  [wi, qt],
  [w + wi, qt],
  [ki, qt],
  [w + ki, qt]
], Zi = (e, t, l) => {
  let [i, s] = e.hook, n = Pl(t, 5);
  q(n, "-");
  let a = e.el, E = e[de][t] || {}, r = E[ni] ? B(Tt) : a, f = e.exec(e, l, "$size", !1);
  i(a, t, ol(f, E[sl] || 100));
  let c = new ResizeObserver((o) => {
    let y = o[0].borderBoxSize[0];
    s(a, t, [y.inlineSize, y.blockSize]);
  });
  c[hr](r, E), V(e, () => c[ml]());
}, ea = [
  [bi, Zi],
  [w + bi, Zi]
], ve = "keyup", et = "keydown", vi = "outside", ta = "window", Ts = "control", ei = "meta", Vt = "arrow", er = [
  ei,
  Ts,
  "shift",
  "alt",
  "fn"
], la = {
  ctrl: Ts,
  cmd: ei,
  super: ei,
  esc: "escape",
  del: M,
  up: Vt + "up",
  down: Vt + "down",
  left: Vt + "left",
  right: Vt + "right"
}, ia = (e, t, l) => {
  let [i, s] = e.hook, n = Pl(t, 5), [a] = q(n, "-"), E = e.el, r = E, f = (R) => {
    let N = e.exec(e, l, xt + Bl, !1);
    Bt(N) ? N(R) : H(Fr(Bl, t, "a " + _l, Ht(N())));
  }, c = e[de][t] || {};
  sl in c && (f = ol(f, c[sl])), xi in c && (f = ff(f, c[xi])), i(E, t, f), c[vi] || c[ni] ? r = Kt : c[ta] && (r = we);
  let o = {};
  F([et, ve], a) && g(J(c, "keys", []), (R) => {
    o[la[R] || R] = !0;
  });
  let y = wt(o), h = a;
  if (F([et, ve], a) && y) {
    let R = {};
    a = t;
    let N = ol((p) => {
      Ge(r, a, p);
    }, 600);
    V(e, he(r, et, (p) => {
      let L = Ce(p.key);
      R[L] || (R[L] = !0), ge(() => {
        R.meta && !F(er, L) && Hl(p, R);
      });
      let m = ne(R);
      y > 1 && ve == h && R.meta && !F(er, L) ? N(m) : et == h && Ge(r, a, m);
    })), V(e, he(r, ve, (p) => {
      et == h && Hl(p, R), Ge(r, a, ne(R)), ve == h && Hl(p, R);
    })), V(e, he(r, "focus", () => {
      rf(R);
    }));
  }
  V(e, he(r, a, (R) => {
    if (c[pr] && R[ks](), c.stop && R.stopPropagation(), !(c.self && R[Tl] !== R.currentTarget) && !(c[vi] && (E.contains(R[Tl]) || !Af(E)))) {
      if (F([et, ve], h)) {
        let N = R[ar];
        if (!(wt(o) == wt(N) && Oi(ne(o), (p) => F(N, p))))
          return;
      }
      s(E, t, R);
    }
  }, c));
}, Hl = (e, t) => {
  let l = Ce(e.key);
  t[l] && Yt(t, l);
}, ra = [/^(b-on-|on-)[\w-]+$/, ia], sa = (e, t, l) => {
  let i = Pl(t, 7);
  l = Cl(l || Gl + `['${i}']`, "$initial");
  let s = z(e.el, i) || "", n = e[de][t] || {};
  e[je](e, t, l, (a) => (E) => {
    let r = E(s), f = n.prop || es(i) && i;
    r || f ? pl(a, i, !f && r === !0 ? "" : r, f) : dl(a, i);
  });
}, fa = [/^(b-bind-|bind-)[\w-]+$/, sa], Xt = Pe(), aa = (e, t, l) => {
  let [i, s] = e.hook, n = `the ${t} ` + xe, a = yi + " a reactive " + C, E = j + "ed", r = e.el, f = pe(r), c = r.type;
  if (!F([K, lt, j], f))
    return H(n, rr, K, `, ${lt}, and ${j} ${We}s.`, r);
  let o = Nf(e.exec(e, l));
  if (!o) {
    H(n, a, r);
    return;
  }
  let y = o(), h, D = () => ht(f == j ? r[de] : m()), R = e[de][t] || {}, N = (I) => {
    let _ = I[Ne(z(I, C)) && L ? tt : C], U = Xt.get(I) || R;
    if (Xe(_) && (U.trim && (_ = W(_)), !U.raw)) {
      let X = Ii(_);
      (Vr(X) || Ne(X) || Xs(X)) && (_ = X);
    }
    return _;
  }, p = (I) => f == K && F(I, c), L = p([Qe, Hi]), m = () => Rt(K + `[type="${Qe}"][name="${r.name}"]`), le = () => p(Qe) && Y(m()) > 1, x = () => {
    let I = [
      [K, Qe, [ie, Ue, jt, ct]],
      [K, Hi, [ie, Ue, jt]],
      [K, ie, [ie]],
      [K, "range", [ie]],
      [K, "", [ie, Ue]],
      [lt, "", [ie, Ue]],
      [j, "", [ie, Ue, jt, ct]]
    ];
    for (let [_, U, X] of I)
      if (f == _ && (!U || c == U)) {
        Ne(y) || Ve(y) || F(X, Ht(y)) || Qr(n, a, $s, _e(X, " or "), `for ${f == K ? c + " " : ""}${_} ${We}s,`, Br(Ht(y)), r);
        break;
      }
  };
  ge(() => {
    x(), j == f ? g(D(), (I) => Xt.set(I, R)) : p(Qe) && Xt.set(r, R);
  }, 1);
  let O = () => {
    if (y = o(), h = N(r), F([K, lt], f))
      if (c == Qe && Re(y))
        r[tt] = F(y, h);
      else if (L)
        r[tt] = y === h;
      else {
        if (r[El] || Kt.activeElement === r && y === h) return;
        y !== h && (r[C] = y);
      }
    else f == j && (Re(y) ? g(D(), (I) => {
      I[E] = F(y, N(I));
    }) : r[C] = y);
  };
  ge(() => V(e, tl(O)), 5);
  let $ = {};
  i(r, t, (I) => {
    if (y = o(), f == j && r.multiple || le()) {
      let _ = [];
      g(D(), (U) => {
        f == j && Xt.set(U, R), (U[E] || U[tt]) && G(_, N(U));
      }), o(_);
    } else o(L && !r[tt] ? !1 : N(r));
  }), (p([oe, "search", "url", "tel", "email", "password"]) || f == lt) && ($[Ns] = uf, $[ps] = yf);
  let P = R.lazy || L || f == j ? "change" : K;
  $[P] = () => s(r, t, o);
  for (let [I, _] of Ni($))
    V(e, he(r, I, _));
}, na = ["b-model", aa], Ea = (e) => {
  e["#"] = /\d/, e["&"] = /[\p{Letter}]/u, e["*"] = /[\p{Letter}\d]/u;
}, rl = "output", He = "cursor", Ci = "character", ti = "quantifier", Sl = "isToken", Ol = "isOptional", li = "isMultiple", ii = "parts", ca = (e, t, l) => {
  let i = e.el, s = e[ql], [n, a] = e.hook;
  if (!(C in i && bl in i))
    return H("the", t, xe, rr, lt, We + "s and textual", K, "types (text, email, etc.).");
  let E = s[l], r = e[de][t] || {}, f = {
    ...r,
    [al]: { ...e[Vl], ...r[al] },
    mask: l,
    [C]: "",
    [He]: i[bl],
    [ii]: [],
    [rl]: ""
  };
  n(i, t, () => {
    f[C] = i[C], f[C] != f[rl] && (f[ii] = [], f[He] = i[bl], E && E(f), ua(f), i[C] = f[rl], i.setSelectionRange(f[He], f[He]), Ge(i, St, f));
  }), ge(() => a(i, t), 7);
  let c = he(i, K, () => a(i, t), !0);
  V(e, c);
}, Ta = (e, t) => {
  let l = [], i = "\\";
  for (let s = 0; s < Y(e); s++) {
    let n = e[s], a = {
      [Ci]: n,
      [ti]: 1,
      [Sl]: !1,
      [Ol]: !1,
      [li]: !1
    };
    if (n != i || n == i && e[s + 1] == i) {
      if (F(ne(t), n) && (e[s - 1] != i || e[s - 2] == i)) {
        let E = hi(ce(e, s + 1), /^\d+/);
        if (E) {
          let f = E[0];
          s += Y(f), a[ti] = +f;
        }
        a[Sl] = !0;
        let r = e[s + 1];
        (r == "?" || r == "+") && (a[Ol] = r == "?", a[li] = r == "+", s++);
      }
      G(l, a);
    }
  }
  return l;
}, oa = (e, t) => Kr(ce(e, t + 1), (l) => !l[Ol]), tr = (e, t, l) => {
  let i = -1;
  if (t) {
    let s = t[Ci];
    if (t[Sl]) {
      let n = hi(e, l[s]);
      n && (i = n[Ar]);
    } else i = Gr(e, s);
  }
  return i;
}, ua = (e) => {
  let t = e[al], l = e[C], i = e[He], s = Ta(e[St], t), n = "", a = l, E = ce(l, i);
  for (let [r, f] of Ni(s)) {
    let c = f[Ci], o = f[ti];
    if (f[Sl]) {
      if (o > 0) {
        if (!a) break;
        let y = "";
        for (; a && (o > 0 || f[li]); ) {
          let h = f[Ol] || o < 1, D = tr(a, f, t), R = h && D > 0 && oa(s, +r), N = tr(a, R, t);
          if (D < 0 || N >= 0 && D > N) {
            h || (a = "");
            break;
          }
          D || (y += a[0], o--), a = ce(a, 1), E == a && (i = Y(n + y));
        }
        n += y, f[C] = y;
      }
    } else a && (E == a && (i = Y(n)), n += c, f[C] = c, a[0] == c && (a = ce(a, 1)));
  }
  e[He] = e[He] == 0 ? 0 : e[He] == Y(e[C]) ? Y(n) : i, e[rl] = n, e[ii] = s;
}, ya = (e) => {
  let t = e[C], l = J(e, "decimal", "."), i = J(e, "thousands", ","), s = J(e, "precision", 2);
  l == "," && (i = "."), i == "." && (l = ",");
  let n = q(t, l), a = n[0], E = Ye(a, "-");
  a = fe(a, /\D/g, ""), a = a && (fe(a, /^0+/, "") || "0");
  let r = Y(n) > 1, f = r ? _e(ce(n, 1), l) : "", c = Y(a), o = E ? "-" : "";
  for (let R = 0; R < c; R++)
    R > 0 && (c - R) % 3 == 0 && (o += i), o += "#";
  let y = e[al];
  t = E ? "-" + a : a, s > 0 && (y[l] = sf(`\\${l}`), r && (t += l + f), o += l + "#" + s), e[St] = o, E && (y["-"] = /-/), y["#"] = /\d/;
  let h = 0, D = "";
  for (let R of e[C])
    R == t[h] ? (D += R, h++) : D += "∅";
  e[C] = D;
}, Aa = [w + St, ca], Ra = (e, t, l) => {
  l = Cl(l, "$controls", !1), e[je](e, t, l, () => async (i, s) => {
    await i(s);
  });
}, Sa = ["b-effect", Ra], Oa = [
  // IMPORTANT: The `b-ignore` directive must be hydrated first because it stops the hydration of the element and its children.
  $f,
  // IMPORTANT: The `b-each` directive must be hydrated second because it hydrates other directives for each item it iterates over.
  kf,
  // Context-related directives
  Lf,
  Hf,
  Mf,
  mf,
  Uf,
  Bf,
  Yf,
  Wf,
  // IMPORTANT: The `b-teleport` directive must be hydrated before the `b-if` directive because `b-if` restores the element to its original position.
  Vf,
  // Conditional directives: These directives usually depend on values from the context
  jf,
  Qf,
  // ['b-boost', hydrateBoost],
  ...Zf,
  // b-transition, b-transition-in, b-transition-out
  ...vf,
  // [b-on|on]-enter, [b-on|on]-exit
  ...ea,
  // [b-on|on]-resize
  ra,
  // [b-on|on]-[eventName]
  /**
   * Data binding directives
   * Used to bind data to an element's property or attribute
   * 
   * - The `b-bind-|bind-` directive is a general directive used to bind data to an element property or attribute.
   * - The `b-model` directive is used to create a two-way data binding between an input value and a reactive property.
   * - The `b-mask` directive is used to format an input value using a mask.
   */
  fa,
  // [b-bind|bind]-[attributeName]
  na,
  Aa,
  /**
   * b-effect: used to create an effect that run when its dependencies change.
   * It is perfect for small expressions, reactive or not.
   * Example: console.log(`Hello, ${$data.name}!`)
   */
  Sa
], Na = (e) => {
  g(Oa, (t) => G(e[Hr], t)), e.masks.money = ya, Ea(e.maskTokens);
}, lr = "currentTime", ir = ee + "d", pa = {
  name: "Anime.js",
  // ? This validation can be improved
  validate: (e) => ["animatables", "autoplay"].every((t) => e.hasOwnProperty(t)),
  [ae]: (e, t) => {
    e[ir] && (e[Me](), e[ee]()), e[lr] != e.duration ? e[ae]() : t();
  },
  [ee]: (e, t) => {
    e[ir] || (e[Me](), e[ee]()), e[lr] != 0 ? e[ae]() : t();
  },
  onComplete: (e, t) => {
    e.complete = t;
  }
}, xl = Bl + "Callback", da = {
  name: "GSAP",
  // ? This validation can be improved
  validate: (e) => [xl, "yoyo"].every((t) => t in e),
  [ae]: (e) => {
    e[ae]();
  },
  [ee]: (e) => {
    e[ee]();
  },
  [fl]: (e, t) => {
    e[xl](fl, t), e[xl]("onReverseComplete", t);
  }
}, ha = (e) => {
  let t = e.effect;
  return t ? Number(t.getTiming().duration) : 0;
}, Ca = {
  name: "Web Animations API",
  validate: (e) => e instanceof Animation,
  [ae]: (e, t) => {
    e.playbackRate < 0 && (e[ee](), e[Me]()), e.currentTime != ha(e) ? e[ae]() : t();
  },
  [ee]: (e, t) => {
    e.currentTime == 0 ? t() : e.playbackRate > 0 && (e[ee](), e[Me]()), e.currentTime != 0 ? e[ae]() : t();
  },
  onComplete: (e, t) => {
    e.onfinish = t;
  }
};
export {
  pa as animeAnimationEngine,
  fa as bindDirective,
  Hf as dataDirective,
  kf as eachDirective,
  da as gsapAnimationEngine,
  mf as htmlDirective,
  jf as ifDirective,
  $f as ignoreDirective,
  vf as intersectionDirectives,
  Aa as maskDirective,
  na as modelDirective,
  ya as moneyMask,
  Ia as newApp,
  ra as onDirective,
  Lf as propsDirective,
  ea as resizeDirectives,
  Yf as scriptDirective,
  Na as setAllDirectives,
  Ea as setDefaultMaskTokens,
  di as settings,
  _a as setup,
  Qf as showDirective,
  Wf as styleDirective,
  Vf as teleportDirective,
  Bf as templateDirective,
  Zf as transitionDirectives,
  Mf as uidDirective,
  Ca as webAnimationsApiAnimationEngine
};
//# sourceMappingURL=briojs.js.map
