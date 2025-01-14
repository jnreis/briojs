let Rl = "brio", Kl = "$", Ce = "after", mr = "animation engine", Wl = "append", it = "array", Ve = "attr", zl = "Attribute", k = "b-", Me = "before", Al = "begin", Mr = "body", xt = "boolean", Ui = "can only be used on", xi = "Cannot ", qe = "checkbox", Je = "checked", Ur = "classList", ql = "composi", xr = "Content", et = "create", Xl = "data", Xt = "debounce", Fi = "define", x = "delete", be = "directive", _l = "disconnect", $l = "display", Bi = "document", Yi = "each", Be = "element", Ft = "end", ui = "entries", Pl = "error", Ke = "evalEffect", Gi = "event", Ki = "EventListener", Wi = "expArgs", gt = "get", Fr = "head", te = "hooks", oi = "href", rt = "html", zi = "HTML", jl = "hydrate", sl = "inner", fl = "insert", Br = "Invalid", yi = "length", vl = "mask", Yr = "method", Ql = "must be", se = `
`, Gr = "name", qi = "Node", pt = "not found.", Ye = null, ce = "number", Ct = "object", Xi = "observe", ji = "once", Kr = "onComplete", Pe = "options", Jl = "outer", nl = "parent", Ri = "patch", Nl = "pause", Ai = "play", Wr = "post", zr = "prepend", vi = "prevent", Qi = "Propert", Zl = Qi + "y", Le = "props", Ji = "put", Si = "radio", wt = "remove", Zi = "replace", Vl = "requires", Vi = "reverse", al = "route", X = "script", qr = "Sibling", El = "skip", ee = "select", kt = "state", er = "start", ei = "storage", Se = "string", Ee = "style", tr = "teleport", Oe = "template", Ne = "text", Oi = "throttle", ti = "tion", lr = "toString", st = "tokens", li = "transition", ir = "type", ht, gl = "update", Xr = "validate", P = "value", rr = "With", jr = "add" + Ki, _t = Kl + Xl, jt = Kl + Yi, vt = Kl + Le, pe = k + Xl, vr = k + Yi, Cl = "b-if", sr = k + Le, Bt = "b-show", Qr = "clone" + qi, Qt = ql + "ng", Jr = ql + ti + er, Zr = ql + ti + Ft, Vr = et + "Element", wl = Fi + Zl, es = Fi + Qi + "ies", di = x + Zl, Et = "func" + ti, ts = gt + zl, le = sl + zi, z = "in" + Ji, ls = fl + "AdjacentHTML", is = "next" + qr, fr = "of " + ir, Rt = Jl + zi, nr = "Own" + Zl, rs = nl + qi, Sl = "path" + Gr, ss = vi + "Default", ar = "proto" + ir, fs = wt + zl, ns = wt + Ki, Jt = Zi + rr, as = al + "Rule", Er = X + "s", Ol = ee + "ionStart", Es = "set" + zl, cs = er + "s" + rr, Ts = ei + "Area", kl = Ee + "s", Zt = "tar" + gt, ii = Oe + "s", Ze = Ne + "area", Ue = Ne + xr, us = "async" + Et, cr = gt + nr + "Descriptor", os = cr + "s", ys = "has" + nr, ri = (e, t, l, i) => `the ${e} ${t} ${Vl} ${l}, ` + bl(i), bl = (e) => `but got ${e} instead.`, Z = (e, t) => e.push(t), si = (e, t) => e.sort(t), Rs = (e) => e[Vi](), he = (e, t) => e.join(t), w = (e, t) => e.forEach(t), de = (e, t, l) => e.map(t, l), tt = (e, t, l) => e.filter(t, l), As = (e, t, l) => e.find(t, l), Tr = (e, t, l) => e.every(t, l), ur = (e, t, l) => e.findIndex(t, l), Ss = (e, t, l) => e.indexOf(t, l), or = (e, t) => t[1] - e[1], ct = (e) => Array.from(e), Os = (e, t = 0) => de(ct({ length: e }), (l, i) => t + i), yr = (e, t) => e[lr](t), q = (e) => e.trim(), bt = (e) => e.toLowerCase(), j = (e, t, l) => e.split(t, l), fi = (e, t) => e.match(t), fe = (e, t, l) => e[cs](t, l), He = (e, t) => t.test(e), oe = (e, t, l) => e[Zi](t, l), ds = (e) => He(e, /^\d+$/), Is = (e) => He(e, /^(\w|\s|\.|\$|`|'|"|(\[(.|\s)+?\]))*;?$/g) && !fe(e, x + " "), cl = (e) => He(q(e), /^((async\s+)?function\s*\([^)]*\)\s*{[^}]*}|(async\s*)?(?:\([^()]*\)|[$\w]+)\s*=>)/), ni = (e) => JSON.stringify(e), ai = (e, t) => {
  try {
    e = JSON.parse(e, t);
  } catch {
  }
  return e;
}, ps = (e) => {
  let t = yr(new URLSearchParams(e));
  return t ? "?" + t : "";
}, ft = (e) => bt(J(Ae[ar][lr].call(e), 8, -1)), We = (e, t) => ft(e) === t, ne = (e) => e === Ye, Ge = (e) => e === ht, Tt = (e) => We(e, Ct), Re = (e) => We(e, it), Lt = (e) => hs(e) || _s(e), hs = (e) => We(e, Et), _s = (e) => We(e, us), Te = (e) => We(e, Se), Rr = (e) => We(e, ce) && isFinite(e), $s = (e) => We(e, xt), Ps = (e) => Tl(e, Ar), Tl = (e, t) => e instanceof t, nt = (e) => Tl(e, Node), Ns = (e) => Tl(e, Text), at = (e) => Tl(e, HTMLElement), me = window, Ae = Object, Xe = Reflect, Yt = location, Ht = document, Ar = RegExp, v = (e, t, l) => Tt(e) && t in e ? e[t] : l, At = (e) => B(ye(e)), gs = (e, ...t) => {
  w(t, ([l, i]) => {
    l in e && (e[i] = e[l], ul(e, l));
  });
}, ye = (e) => Ae.keys(e), Sr = (e = Ye) => Ae[et](e), Cs = (e, t = {}) => {
  const l = Sr(e);
  return Ae[es](
    l,
    Ae[os](t)
  ), l;
}, ws = (e, t, l = Ae) => l[cr](e, t), ks = (e) => Ae.getPrototypeOf(e), $t = (e, t) => Ae[ar][ys].call(e, t), ie = (e, t, l = {}) => {
  gs(l, ["v", P], ["w", "writable"], ["e", "enumerable"], ["c", "configurable"]), Ae[wl](e, t, l);
}, bs = (e, t = {}) => {
  w(ye(e), (l) => {
    ie(e, l, t);
  });
}, ul = (e, t) => delete e[t], Ls = (e) => w(ye(e), (t) => {
  ul(e, t);
}), ge = () => /* @__PURE__ */ new Map(), Vt = (e, t) => new Ar(e, t), b = (e, t, l) => e.includes(t, l), Ei = (e) => Tt(e) ? Ae[ui](e) : e[ui](), J = (e, t, l) => e.slice(t, l), B = (e) => Ge(e[yi]) ? e.size : e[yi], De = (e, t = 0) => setTimeout(e, t), el = (e, t) => {
  let l;
  return (...i) => {
    clearTimeout(l), l = De(() => e(...i), t);
  };
}, Hs = (e, t) => {
  let l = 0;
  return (...i) => {
    let r = Date.now();
    if (!(r - l < t))
      return l = r, e(...i);
  };
}, Or = (e = 8) => "b" + J(oe(crypto.randomUUID(), /-/g, ""), 0, e - 1), dr = (e, ...t) => console[e]("Brio.js", ...t), Ir = (...e) => dr("warn", "warn:", ...e), H = (...e) => dr(Pl, `detected an ${Pl}:`, ...e), Ll = !1, Hl = [], pr = (e) => (Hl = [], Ll = !0, e({}), Ll = !1, [...Hl]), Ds = (e) => {
  let t = pr(e), l = [];
  for (let r of t) {
    let s = B(l) - 1, f = l[s];
    f && f[0][f[1]] === r[0] ? l[s] = r : Z(l, r);
  }
  l = l.filter((r) => r[1] in r[0]).filter(([r, s], f, n) => ur(n, ([E, a]) => r === E && s == a) == f);
  let i;
  if (B(l) == 1) {
    let [r, s] = l[0];
    i = (f) => Ge(f) ? r[s] : r[s] = f;
  }
  return i;
}, dl = Sr(), ms = () => zt, U = (e, t, l = "", i = !1) => {
  let r = 0, s;
  return Is(t) ? (s = Ds(() => Ii(e, t)), s ? (r = 1, Lt(s()) && (r = 2, t = ke(`${t}(${l})`, l, i))) : t = ke(t, l, i)) : cl(t) || (t = ke(t, l, i)), [r == 1 ? s : (...n) => Ii(e, t)(...n), r];
}, Ii = (e, t) => {
  let l = dl[t];
  try {
    l || (l = new Function(Pt[Wi], `return(${t})`)), !dl[t] && B(t) < 99 && (dl[t] = l), l = l({ ...e.gc, ...e.lc });
  } catch (i) {
    H(i.message, "in expression:", t), l = ms;
  }
  return l;
}, ke = (e, t = "", l = !1) => `(${t})=>${l ? "{" : "("}${se + e + se}${l ? "}" : ")"}`, Ms = (e, t, l, i) => {
  let [r, s] = i[te], f = J(t, fe(t, k) ? 5 : 3), [n] = j(f, "-"), E = e[Pe][t] || {}, a = e.el, [c, T] = U(e, l, "$entry", !0);
  r(a, t, el(c, E[Xt] || 100));
  let u = new IntersectionObserver((I) => {
    w(I, async (y) => {
      y.isIntersecting != (n == "exit") && (T != 1 ? await s(a, t, y) : H(ri(Gi, t, "a " + Et, ft(c()))), E[ji] && u[_l]());
    });
  }, E);
  u[Xi](a), Q(e, () => u[_l]());
}, ut = (e, t = Ht) => ct(t.querySelectorAll(e)), M = (e, t = Ht) => Te(e) ? ut(e, t)[0] : e, ae = (e, t, ...l) => e[t](...l), Us = (e, t, l) => {
  t == le || t == Rt ? e[t] = l : e[ls](t, l);
}, xs = (e, t, l) => {
  l && re(l) ? ae(l, Me, e) : ae(t, Wl, e);
}, Fs = (e) => e[Qr](!0), pi = (e) => {
  let t = re(e);
  if (t) {
    let l = ue(t), i = l.indexOf(e), r = Rs(J(l, 0, i)), s = J(l, i + 1);
    return () => {
      let f = !1;
      for (let n of s)
        if (re(n) == t) {
          ae(n, Me, e), f = !0;
          break;
        }
      if (!f) {
        for (let n of r)
          if (re(n) == t) {
            ae(n, Ce, e), f = !0;
            break;
          }
      }
      f || ae(t, Wl, e);
    };
  }
}, Dl = (e, t) => w(ct(e.attributes), ({ name: l, value: i }) => t(l, i)), ol = (e) => e[wt](), re = (e) => e[rs], Bs = (e) => e[is], hr = (e) => q(e[Ue] || ""), ue = (e) => [...e.childNodes], Y = (e, t) => e[ts](t), St = (e, t, l, i) => {
  i && (e[i] = l), e[Es](t, l);
}, yl = (e, t) => e[fs](t), Ys = (e, t) => e[Ur].add(t), ci = (e, t) => Ht[Vr](e, t), Gs = (e) => new DOMParser().parseFromString(e, Ne + "/" + rt), _e = (e) => bt(e.tagName || ""), Ie = (e, t, l, i) => (Te(e) && (e = M(e)), e[jr](t, l, i), () => e[ns](t, l)), xe = (e, t, l) => M(e).dispatchEvent(new CustomEvent(bt(oe(t, /[^a-z\d]/gi, "")), {
  bubbles: !0,
  cancelable: !0,
  detail: l
})), ml = async (e, t) => {
  if (await t(e))
    for (let l of ue(e))
      await ml(l, t);
}, Ks = (e) => e[Zt][Qt] = !0, Ws = (e) => {
  let t = e[Zt];
  t[Qt] && (t[Qt] = !1, xe(t, z));
}, _r = (e) => me.getComputedStyle(e), zs = (e) => {
  let t = _r(e);
  return !(!re(e) || t[$l] == "none" || t.visibility == "hidden" || t.opacity == "0");
}, qs = (e, t) => new URL(e, t), Gt = (e = "", t = oi) => qs(e, Yt[oi])[t], $r = (e) => b(["src", P, Je, ee + "ed"], e), hi = (e, t = "") => `:not([${e}]${t})`, Xs = (e, t, l, i) => {
  let [r, s] = i[te], f = J(t, fe(t, k) ? 5 : 3);
  j(f, "-");
  let n = e.el, E = e[Pe][t] || {}, a = E[Bi] ? M(rt) : n, [c] = U(e, l, "$size", !0);
  r(n, t, el(c, E[Xt] || 100));
  let T = new ResizeObserver((u) => {
    let I = u[0].borderBoxSize[0];
    s(n, t, [I.inlineSize, I.blockSize]);
  });
  T[Xi](a, E), Q(e, () => T[_l]());
}, je = "keyup", ve = "keydown", _i = "outside", js = "window", Pr = "control", Ml = "meta", Dt = "arrow", $i = [
  Ml,
  Pr,
  "shift",
  "alt",
  "fn"
], vs = {
  ctrl: Pr,
  cmd: Ml,
  super: Ml,
  esc: "escape",
  del: x,
  up: Dt + "up",
  down: Dt + "down",
  left: Dt + "left",
  right: Dt + "right"
}, Qs = (e, t, l, i) => {
  let [r, s] = i[te], f = J(t, fe(t, k) ? 5 : 3), [n] = j(f, "-");
  if (n == "enter" || n == "exit")
    return Ms(e, t, l, i);
  if (n == "resize")
    return Xs(e, t, l, i);
  let E = e.el, a = E, c = (A) => {
    let [g] = U(e, l, "$event", !0);
    Lt(g) ? g(A) : H(ri(Gi, t, "a " + Et, ft(g())));
  }, T = e[Pe][t] || {};
  Xt in T && (c = el(c, T[Xt])), Oi in T && (c = Hs(c, T[Oi])), r(E, t, c), T[_i] || T[Bi] ? a = Ht : T[js] && (a = me);
  let u = {};
  b([ve, je], n) && w(v(T, "keys", []), (A) => {
    u[vs[A] || A] = !0;
  });
  let I = At(u), y = n;
  if (b([ve, je], n) && I) {
    let A = {};
    n = t;
    let g = el((_) => {
      xe(a, n, _);
    }, 600);
    Q(e, Ie(a, ve, (_) => {
      let D = bt(_.key);
      A[D] || (A[D] = !0), De(() => {
        A.meta && !b($i, D) && Il(_, A);
      });
      let G = ye(A);
      I > 1 && je == y && A.meta && !b($i, D) ? g(G) : ve == y && xe(a, n, G);
    })), Q(e, Ie(a, je, (_) => {
      ve == y && Il(_, A), xe(a, n, ye(A)), je == y && Il(_, A);
    })), Q(e, Ie(a, "focus", () => {
      Ls(A);
    }));
  }
  Q(e, Ie(a, n, (A) => {
    if (T[vi] && A[ss](), T.stop && A.stopPropagation(), !(T.self && A[Zt] !== A.currentTarget) && !(T[_i] && (E.contains(A[Zt]) || !zs(E)))) {
      if (b([ve, je], y)) {
        let g = A.detail;
        if (!(At(u) == At(g) && Tr(ye(u), (_) => b(g, _))))
          return;
      }
      s(E, t, A);
    }
  }, T));
}, Il = (e, t) => {
  let l = bt(e.key);
  t[l] && ul(t, l);
}, Js = (e, t, l, i) => {
  let r = J(t, fe(t, k) ? 7 : 5);
  l = l || _t + `['${r}']`, cl(l) || (l = ke(l, "$initial"));
  let s = Y(e.el, r) || "", f = e[Pe][t] || {};
  i[Ke](e, t, l, (n) => ([E]) => {
    let a = E(s), c = f.prop || $r(r) && r;
    a || c ? St(n, r, !c && a === !0 ? "" : a, c) : yl(n, r);
  });
}, Zs = (e) => {
  let t = (l, i, r) => (Z(r.skip, i), Fe[x](t), e);
  return Fe.add(t), t;
}, $e = (e, t) => {
  if (!mt(e) || lt(e)) return e;
  let l = v(t, nl, Ye), i = v(t, El, []);
  t = { parent: l, skip: i };
  let r = {
    get(f, n) {
      return Ll && ($t(f, n) || !(n in f)) && Z(Hl, [s, n]), Xe.get(f, n, s);
    },
    set(f, n, E) {
      n in f || ie(f, n, { w: !0, e: !0, c: !0 });
      let a = s[n];
      if (a === E) return !0;
      Fe.has(E) && (E = E(s, n, t)), b(i, n) || (E = $e(E)), lt(a) && mt(E) && (dt.set(E, It(a)), dt[x](a));
      let c = Xe.set(f, n, E, s);
      return Pi(It(s), s, n, E, a), c;
    },
    [di](f, n) {
      let E = It(s), a = f[n], c = Xe[di](f, n);
      return Pi(E, s, n, ht, a), c;
    },
    [wl](f, n, E) {
      return Fe.has(E[P]) && (E[P] = E[P](s, n, t)), !b(i, n) && mt(E[P]) && (E[P] = $e(E[P])), Xe[wl](f, n, E);
    }
  };
  const s = new Proxy(lt(l) ? Cs(l, e) : e, r);
  dt.set(s, {
    [kt]: ge(),
    [Le]: {}
  });
  for (let f in e) {
    let n = e[f];
    Fe.has(e[f]) && (n = e[f](s, f, t), Xe.set(e, f, n, s)), !b(i, f) && mt(n) && Xe.set(e, f, $e(n), s);
  }
  return s;
}, mt = (e) => Re(e) || Tt(e), Pi = (e, t, l, i, r) => {
  let f = { operation: Ge(r) ? et : Ge(i) ? x : gl, state: t, prop: l, newValue: i, oldValue: r };
  Ni(e[kt], f), e[Le][l] && Ni(e[Le][l], f);
}, Ni = async (e, t) => {
  let l = ct(e);
  si(l, or);
  for (let [i] of l) await i(t);
}, Nr = "getItem", gr = "setItem", Ul = ge(), Vs = (e) => {
  let t = ks(e);
  return t && $t(t, Nr) && $t(t, gr);
}, xl = (e, t) => ai(e[Nr](t) || ""), gi = (e, t, l) => e[gr](t, ni(l)), Ci = (e) => "_b_" + e, Cr = (e, t, l) => {
  if (!Vs(e))
    return H(Br, ei, Ct);
  l && (l = Ci(l), $t(e, l) && (t = xl(e, l)));
  let i = (r, s) => (l = l || Ci(s), Ot(r, s, ({ newValue: f }) => {
    gi(e, l, f);
  }), $t(e, l) ? t = xl(e, l) : gi(e, l, t), Ul.set(l, [r, s, e]), Fe[x](i), t);
  return Fe.add(i), i;
}, ef = (e) => {
  if (Ul.has(e.key)) {
    let [t, l, i] = Ul.get(e.key);
    i === e[Ts] && (t[l] = xl(i, e.key));
  }
}, Kt = (e, t, l = 0) => {
  let i = [], r = pr(t || e);
  return w(r, ([s, f]) => {
    Z(i, kr(s, f, e, l));
  }), t && e({}), () => w(i, (s) => s());
}, Ot = (e, t, l, i = 0) => (
  // If the proxied object is not an observed state, log an error and return an empty function
  !lt(e) && !H(xi + `watch non-${kt} ${Ct}/${it}.`) ? () => {
  } : !t && t !== 0 ? wr(e, l, i) : kr(e, t, l, i)
), dt = ge(), Fe = /* @__PURE__ */ new Set(), lt = (e) => dt.has(e), It = (e) => dt.get(e), wr = (e, t, l = 0) => {
  if (lt(e)) {
    let i = It(e)[kt];
    return i.set(t, l), () => i[x](t);
  }
}, kr = (e, t, l, i = 0) => {
  let r = It(e)[Le];
  r[t] || (r[t] = ge()), r[t].set(l, i);
  let s = wr(e[t], l, i);
  return () => {
    r[t][x](l), s && s();
  };
};
ie($e, "persist", { v: (e, t) => Cr(localStorage, e, t) });
ie($e, "session", { v: (e, t) => Cr(sessionStorage, e, t) });
ie($e, El, { v: Zs });
let Mt = ge(), tf = (e, t, l, i) => {
  let [r, s] = i[te], f = `the ${t} ` + be, n = Vl + " a reactive " + P, E = ee + "ed", a = e.el, c = _e(a), T = a.type;
  if (!b([z, Ze, ee], c))
    return H(f, Ui, z, `, ${Ze}, and ${ee} ${Be}s.`, a);
  let [u, I] = U(e, l);
  if (I != 1)
    return H(f, n + ",", bl(u()));
  let y = u(), h, A = () => ct(c == ee ? a[Pe] : F()), g = e[Pe][t] || {}, _ = (d) => {
    let C = d[ne(Y(d, P)) && G ? Je : P], o = Mt.get(d) || g;
    if (Te(C) && (o.trim && (C = q(C)), !o.raw)) {
      let S = ai(C);
      (Rr(S) || ne(S) || $s(S)) && (C = S);
    }
    return C;
  }, D = (d) => c == z && b(d, T), G = D([qe, Si]), F = () => ut(z + `[type="${qe}"][name="${a.name}"]`), $ = () => D(qe) && B(F()) > 1, O = () => {
    let d = [
      [z, qe, [ce, Se, xt, it]],
      [z, Si, [ce, Se, xt]],
      [z, ce, [ce]],
      [z, "range", [ce]],
      [z, "", [ce, Se]],
      [Ze, "", [ce, Se]],
      [ee, "", [ce, Se, xt, it]]
    ];
    for (let [C, o, S] of d)
      if (c == C && (!o || T == o)) {
        ne(y) || Ge(y) || b(S, ft(y)) || Ir(f, n, fr, he(S, " or "), `for ${c == z ? T + " " : ""}${C} ${Be}s,`, bl(ft(y)), a);
        break;
      }
  };
  De(() => {
    O(), ee == c ? w(A(), (d) => Mt.set(d, g)) : D(qe) && Mt.set(a, g);
  }, 1);
  let m = () => {
    if (y = u(), h = _(a), b([z, Ze], c))
      if (T == qe && Re(y))
        a[Je] = b(y, h);
      else if (G)
        a[Je] = y === h;
      else {
        if (a[Qt] || Ht.activeElement === a && y === h) return;
        y !== h && (a[P] = y);
      }
    else c == ee && (Re(y) ? w(A(), (d) => {
      d[E] = b(y, _(d));
    }) : a[P] = y);
  };
  De(() => Q(e, Kt(m)), 5);
  let N = {};
  r(a, t, (d) => {
    if (y = u(), c == ee && a.multiple || $()) {
      let C = [];
      w(A(), (o) => {
        c == ee && Mt.set(o, g), (o[E] || o[Je]) && Z(C, _(o));
      }), u(C);
    } else u(G && !a[Je] ? !1 : _(a));
  }), (D([Ne, "search", "url", "tel", "email", "password"]) || c == Ze) && (N[Jr] = Ks, N[Zr] = Ws);
  let V = g.lazy || G || c == ee ? "change" : z;
  N[V] = () => s(a, t, u);
  for (let [d, C] of Ei(N))
    Q(e, Ie(a, d, C));
}, Wt = "output", we = "cursor", Ti = "character", Fl = "quantifier", tl = "isToken", ll = "isOptional", Bl = "isMultiple", Yl = "parts", lf = (e, t, l, i) => {
  let r = e.el, [s, f] = i[te];
  if (!(P in r && Ol in r))
    return H("the", t, be, Ui, Ze, Be + "s and textual", z, "types (text, email, etc.).");
  let n = l, E;
  i.masks[n] && (E = i.masks[n]);
  let a = e[Pe][t] || {}, c = {
    ...a,
    tokens: { ...i[st], ...a[st] },
    mask: n,
    [P]: "",
    [we]: r[Ol],
    [Yl]: [],
    [Wt]: ""
  };
  s(r, t, () => {
    c[P] = r[P], c[P] != c[Wt] && (c[Yl] = [], c[we] = r[Ol], E && E(c), ff(c), r[P] = c[Wt], r.setSelectionRange(c[we], c[we]), xe(r, vl, c));
  }), De(() => f(r, t), 7);
  let T = Ie(r, z, () => f(r, t), !0);
  Q(e, T);
}, rf = (e, t) => {
  let l = [], i = "\\";
  for (let r = 0; r < B(e); r++) {
    let s = e[r], f = {
      [Ti]: s,
      [Fl]: 1,
      [tl]: !1,
      [ll]: !1,
      [Bl]: !1
    };
    if (s != i || s == i && e[r + 1] == i) {
      if (b(ye(t), s) && (e[r - 1] != i || e[r - 2] == i)) {
        let n = fi(J(e, r + 1), /^\d+/);
        if (n) {
          let a = n[0];
          r += B(a), f[Fl] = +a;
        }
        f[tl] = !0;
        let E = e[r + 1];
        (E == "?" || E == "+") && (f[ll] = E == "?", f[Bl] = E == "+", r++);
      }
      Z(l, f);
    }
  }
  return l;
}, sf = (e, t) => As(J(e, t + 1), (l) => !l[ll]), wi = (e, t, l) => {
  let i = -1;
  if (t) {
    let r = t[Ti];
    if (t[tl]) {
      let s = fi(e, l[r]);
      s && (i = s.index);
    } else i = Ss(e, r);
  }
  return i;
}, ff = (e) => {
  let t = e[st], l = e[P], i = e[we], r = rf(e[vl], t), s = "", f = l, n = J(l, i);
  for (let [E, a] of Ei(r)) {
    let c = a[Ti], T = a[Fl];
    if (a[tl]) {
      if (T > 0) {
        if (!f) break;
        let u = "";
        for (; f && (T > 0 || a[Bl]); ) {
          let I = a[ll] || T < 1, y = wi(f, a, t), h = I && y > 0 && sf(r, +E), A = wi(f, h, t);
          if (y < 0 || A >= 0 && y > A) {
            I || (f = "");
            break;
          }
          y || (u += f[0], T--), f = J(f, 1), n == f && (i = B(s + u));
        }
        s += u, a[P] = u;
      }
    } else f && (n == f && (i = B(s)), s += c, a[P] = c, f[0] == c && (f = J(f, 1)));
  }
  e[we] = e[we] == 0 ? 0 : e[we] == B(e[P]) ? B(s) : i, e[Wt] = s, e[Yl] = r;
}, nf = (e) => {
  let t = e[P], l = v(e, "decimal", "."), i = v(e, "thousands", ","), r = v(e, "precision", 2);
  l == "," && (i = "."), i == "." && (l = ",");
  let s = j(t, l), f = s[0], n = fe(f, "-");
  f = oe(f, /\D/g, ""), f = f && (oe(f, /^0+/, "") || "0");
  let E = B(s) > 1, a = E ? he(J(s, 1), l) : "", c = B(f), T = n ? "-" : "";
  for (let h = 0; h < c; h++)
    h > 0 && (c - h) % 3 == 0 && (T += i), T += "#";
  let u = e[st];
  t = n ? "-" + f : f, r > 0 && (u[l] = Vt(`\\${l}`), E && (t += l + a), T += l + "#" + r), e.mask = T, n && (u["-"] = /-/), u["#"] = /\d/;
  let I = 0, y = "";
  for (let h of e[P])
    h == t[I] ? (y += h, I++) : y += "∅";
  e[P] = y;
}, af = (e, t, l, i) => {
  let r = e.el, [s, f] = i[te], { hydrate: n, dehydrate: E } = i.$dom;
  e[El] = !0;
  let [a, c] = de(j(l, " in "), q), [T, u] = de(j(a, ","), q);
  u || (u = "index");
  let I = `the ${t} ${be} ` + Vl;
  if (!ki(T) || !ki(u))
    return H(I, "a valid alias.");
  let y = U(e, ke(c))[0](), h = lt(y);
  if (Rr(y) && (y = Os(y, 1)), !(Re(y) || Tt(y)))
    return H(I, `an ${it}, ${Ct}, or ${ce}.`);
  let A = Bs(r), g = re(r);
  ol(r);
  let _ = {}, D = t + "-" + et, G = t + "-" + gl, F = t + "-" + x;
  s(r, D, ([O, m]) => {
    let N = Fs(r);
    xs(N, g, A);
    let V = i.newVNode(N);
    rl(V, "", "");
    let d = $e({});
    ie(d, T, { v: m, w: !0, e: !0 }), ie(d, u, { v: O, w: !0, e: !0 }), ie(V.lc, jt, { v: d, e: !0 }), Q(V, Ot(d, u, ({ newValue: C }) => {
      let o = _[O][1];
      C !== o && (d[u] = o);
    })), h && Q(V, Ot(d, T, ({ newValue: C }) => {
      y[d[u]] = C;
    })), _[O] = [N, O], n(N);
  }), s(r, G, ([O, m]) => {
    let N = _[O], V = i.getVNode(N && N[0]);
    if (V) {
      let d = V.lc[jt];
      d[T] = m, d[u] = O, N[1] = O;
    }
  }), s(r, F, ([O, m]) => {
    let [N] = _[O];
    E(N), ul(_, O);
  });
  let $ = {
    [et]: (O) => f(r, D, O),
    [gl]: (O) => f(r, G, O),
    [x]: (O) => f(r, F, O)
  };
  for (let O of Ei(y))
    $[et](O);
  h && Q(e, Ot(y, "", ({ operation: O, prop: m, newValue: N }) => {
    $[O]([m, N]);
  }));
}, ki = (e) => He(e, /^[a-z_$][\w$]*$/i), Ef = async (e, t, l) => {
  let [i, r] = l[te], s = e.el;
  i(s, t, () => {
    let f = e.lc.$refs, n = ` [${t}]`, E = ut(n + hi(pe) + hi(pe, n), s);
    w([s, ...E], (a) => {
      let c = Y(a, t);
      if (c) {
        let T = f[c];
        T ? Re(T) ? Z(T, a) : f[c] = [T, a] : f[c] = a, yl(a, t);
      }
    });
  }), await r(s, t);
}, bi = async (e, t, l, i) => {
  let [r, s] = i[te];
  l || (l = "{}");
  let f = t == pe, n = e.el, E = e.lc[f ? _t : vt], a = f ? i[Xl] : i[Le];
  r(n, t, async () => {
    let c = l in a ? a[l] : U(e, l, "", !1)[0];
    if (c = await c(e.lc, e.gc), !Tt(c))
      return e[El] = !0, H(ri(be, t, "an " + Ct, ft(c)));
    for (let T in c) ie(E, T, ws(c, T));
    f && await Ef(e, "b-ref", i);
  }), await s(n, t, E);
}, Ut = {}, cf = async (e, t, l, i) => {
  if (!l) return;
  let r = e.el, [s, f] = i[te];
  s(r, t, () => {
    let n = U(e, l)[0]();
    if (!Re(n) || !Tr(n, Te))
      return H("the", t, be, Ql, `an ${it} of ${Se}(s).`);
    e.uid = n.reduce((E, a) => (a in Ut ? Ut[a]++ : Ut[a] = 1, E[a] = Ut[a], E), {});
  }), await f(r, t);
}, Tf = (e, t, l, i) => {
  i[Ke](e, t, l, (r) => {
    let s = re(r), f = pi(r);
    return ([n]) => {
      let E = n();
      De(() => {
        if (E) f();
        else {
          let a = re(r);
          a && (a != s && (s = a, f = pi(r)), r[wt]());
        }
      });
    };
  });
}, uf = (e, t, l, i) => {
  let r = _r(e.el)[$l];
  r == "none" && (r = "block"), i[Ke](e, t, l, (s) => ([f]) => {
    let n = f();
    re(s) && De(() => {
      s[Ee][$l] = n ? r : "none";
    });
  });
}, Li = (e) => (t, l, i, r) => {
  i in r[ii] && (i = ke(ni(i))), r[Ke](t, l, i, (s) => async ([f]) => {
    await r.$dom[fl](f(), e, s);
  });
}, of = (e, t, l, i) => {
  cl(l) || (l = ke(l, "$controls", !0)), i[Ke](e, t, l, () => async ([r], s) => {
    await r(s);
  });
}, yf = (e, t, l, i) => {
  let r, s;
  try {
    r = M(l), nt(r) && (l = ke(ni(l)));
  } catch {
  }
  i[Ke](e, t, l, (f) => ([n]) => {
    try {
      let E = n();
      Re(E) ? [r, s] = E : r = M(E);
    } catch {
    }
    b([Me, Ce, zr, Wl], s) || (s = Ce), nt(r) ? ae(r, s, f) : Ir(tr, Be, pt, t + `="${l}"`);
  });
}, Hi = 1 / 0, Rf = (e, t, l, i) => {
  let r = e[Ve][Cl] ? Cl : e[Ve][Bt] ? Bt : "";
  if (!r)
    return H("the", t, be, Ql, "accompanied by an b-if or", Bt, be);
  let [s] = i[te], [f, n] = i[li], E = U(e, l)[0]();
  E[Nl](), s(e.el, r, (a, c) => f(E, a, c), Hi), s(e.el, r, (a, c) => n(E, a, c), -Hi);
}, ot = (e) => async (t, l, i = {}) => {
  let r = "status", s = v(i, "parser");
  b([gt, x], e) && Tt(l) && (t += ps(l), l = ht);
  try {
    let f = await fetch(t, { ...i, [Yr]: e, body: l });
    if (!f.ok) {
      let E = new Error(`HTTP ${Pl}! ${r}: ${f[r]}`);
      throw E.response = f, E;
    }
    let n = await f[s || Ne]();
    if (!s)
      try {
        n = ai(n);
      } catch {
      }
    return n;
  } catch (f) {
    throw f;
  }
}, il = {
  get: ot(gt),
  post: ot(Wr),
  put: ot(Ji),
  [Ri]: ot(Ri),
  [x]: ot(x)
}, Af = async (e, t, l, i) => {
  let r = e.el, s = i[Er], f = _e(r) == X;
  e.skip = f;
  let [n, E] = i[te], a = l ? s[l] || U(e, l)[0]() : [];
  a = de(
    Re(a) ? a : [a],
    (c) => s[c] || c
  ), n(r, t, async () => {
    if (f) {
      let T = Y(r, "src");
      T && br.add(T);
      let u = T ? await il.get(T) : hr(r) || "0";
      Z(a, Nt(u)), ol(r);
    }
    let c = { ...e.gc, ...e.lc };
    for (let T of a) {
      let u = T;
      Lt(u) || (u = U(e, u, "", !cl(u))[0]), await u(c);
    }
  }), await E(r, t);
}, Sf = (e, t, l, i) => {
  let r = e.el;
  if (_e(r) != Ee) {
    let [s, f] = i[te], n = i[kl][l] || U(e, l)[0]();
    n = de(
      Re(n) ? n : [n],
      (a) => i[kl][a] || a
    );
    let E = Or();
    s(r, t, () => {
      Ys(r, E);
      let a = ci(Ee);
      a[Ue] = Of(he(n, se), "." + E), i.$dom[jl](a, r), ae(r, Ce, a);
    }), f(r, t, E);
  }
}, Of = (e, t) => {
  e = oe(e, /\/\*[\s\S]*?\*\//g, ""), e = Lr(e);
  let l = [], i = Or();
  for (; He(e, qt); ) {
    let E = fi(e, qt);
    E && (Z(l, E[0]), e = oe(e, qt, i));
  }
  let r = tt(j(e, "}"), q), s = se + "    ", n = he(de(r, (E) => {
    let [a, c] = j(E, "{"), T = de(
      de(j(a, ","), q),
      (u) => b(u, "&") ? oe(u, /&/g, t) : t + " " + u
    );
    return c = he(de(tt(j(c || "", se), q), q), s), he(T, ",") + ` {${s + c + se}}`;
  }), se);
  return w(l, (E) => {
    n = oe(n, i, E);
  }), n;
}, df = async (e, t, l) => {
  e.skip = !l || !!await U(e, l)[0]();
}, If = (e, t, l, i) => {
  let r = e.el, s = i[ii][l] || U(e, l)[0](), [f, n] = i[te];
  f(r, t, async () => {
    await i.$dom[fl](s, sl, r), ae(r, Jt, ...ue(r));
  }), n(r, t);
}, pl = (e) => Vt(`^(${e})[\\w-]*$`), Gl = [
  // IMPORTANT: The `b-ignore` directive must be hydrated first because it stops the hydration of the element and its children.
  ["b-ignore", df],
  // IMPORTANT: The `b-each` directive must be hydrated second because it hydrates other directives for each item it iterates over.
  [vr, af],
  // Context-related directives
  [sr, bi],
  [pe, bi],
  ["b-uid", cf],
  [k + rt, Li(sl)],
  [k + Ne, Li(Ne)],
  [k + Oe, If],
  [k + X, Af],
  [k + Ee, Sf],
  // IMPORTANT: The `b-teleport` directive must be hydrated before the `b-if` directive because `b-if` restores the element to its original position.
  [k + tr, yf],
  // Conditional directives: These directives usually depend on values from the context
  [Cl, Tf],
  [Bt, uf],
  // ['b-boost', hydrateBoost],
  [k + li, Rf],
  // b-on: used to create event listeners. Including special listeners such as `on-enter`, `on-exit`, and `on-resize`
  [pl("b-on-|on-"), Qs],
  // [b-on|on]-[eventName]-[...eventAlias]
  /**
   * Data binding directives
   * Used to bind data to an element's property or attribute
   * 
   * - The `b-model` directive is used to create a two-way data binding between an input value and a reactive property.
   * - The `b-mask` directive is used to format an input value using a mask.
   * - The `b-bind-|bind-` directive is a general directive used to bind data to an element property or attribute.
   */
  [pl("b-bind-|bind-"), Js],
  // [b-bind|bind]-[...attributeNames]
  ["b-model", tf],
  ["b-mask", lf],
  /**
   * b-effect: used to create one or more effects that run when their dependencies change.
   * It is perfect for small expressions, reactive or not.
   * Example: console.log(`Hello, ${$data.name}!`)
   */
  [pl("b-effect"), of]
  // b-effect-[effectAlias]
], pf = (e, t, l) => {
  let i = Te(l) && fe(l, k) ? ur(Gl, ([r]) => b(yr(r), l)) : -1;
  i > -1 && (i = i + 1), Gl.splice(i, 0, [e, t]);
}, Qe = (e, t, l = Lt, i = Et) => (r, s) => {
  l(s) ? t[r] = s : H("the", e, `"${r}"`, Ql, fr, i);
}, hf = (e, t, l) => async (i, r, s, f) => {
  let n = r == Jl ? Rt : r == sl ? le : r == Ne ? Ue : r == Me ? Me + Al : r == "first" ? Ce + Al : r == "last" ? Me + Ft : r == Ce ? Ce + Ft : r, E = "$dom." + fl, a = M(s), c = M(Fr), T = M(Mr);
  if (!a) return H(E, Be, pt);
  (c == a || T == a) && (n = le);
  let u = M(rt) == a, I = n == Ue, y = I || n == le, h = n == Rt, A = y ? a : re(a);
  if (!A && !u) return H(E, nl, Be, pt);
  i = await i, i in l && (i = q(l[i]));
  let g = nt(i) ? i : Gs(i), _ = v(f, ee);
  _ && (i = M(_, g)), nt(i) && (i = i[Rt]), (h || u) && t(a, !1), y && w(ue(a), ($) => t($));
  let D = new Set(ue(a));
  A && w(ue(A), ($) => D.add($));
  let G = ($) => tt(ue($), (O) => !D.has(O)), F = [];
  u ? (a[le] = M(rt, g)[le], F = [a, ...ut(X, a)]) : y ? (a[I ? Ue : le] = i, F = ue(a)) : h ? (a[Rt] = i, F = G(A)) : (Us(a, n, i), F = G(n == Me + Al || n == Ce + Ft ? A : a)), si(F, ($, O) => {
    let m = _e($) == Ee, N = _e(O) == Ee;
    return m && !N ? -1 : N && !m ? 1 : 0;
  }), w(F, ($) => {
    if (
      // is script element
      _e($) == X && // is not b-script
      ne(Y($, k + X)) && // should load: !(b-load-once attribute AND script already loaded)
      !(!ne(Y($, "b-load-" + ji)) && br.has(Y($, "src")))
    ) {
      let O = ci(X);
      Dl($, (m, N) => St(O, m, N, $r(m) && m)), O[le] = $[le], ae($, Jt, O);
    }
  }), v(f, jl, !0) && w(F, ($) => e($, a));
}, _f = (e, t, l) => [
  // Set a route
  (i, r) => {
    if (Lt(r)) {
      i = Gt(i, Sl);
      let s = tt(j(i, "/"), q), f = B(s) - 1, n = e;
      w(s, (E, a) => {
        E in n || (n[E] = {}), n = n[E], a == f && (n[zt] = r);
      });
    } else H(xi, "set route without a route", Et, se, i);
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
    if (!fe(Gt(i), Yt.origin))
      return Yt.href = i, Ye;
    i = Gt(i, Sl);
    let r = tt(j(i, "/"), q), s = e, f = {}, n = 0;
    for (let E of r) {
      if (n = 0, E in s && !fe(E, ":"))
        s = s[E], n = 1;
      else for (let a of ye(s))
        if (fe(a, ":")) {
          let [c, T] = tt(j(a, ":"), q);
          if (!T || T && T in t && t[T](E)) {
            let u = f[c];
            u ? Re(u) ? Z(u, E) : f[c] = [u, E] : f[c] = E, s = s[a], n = 1;
            break;
          }
        }
      if (!n) break;
    }
    return n = n && s[zt] ? 1 : 0, n ? s[zt]({ params: f, routePath: i }) : l(il.get(i), Jl, rt), i != Yt[Sl] && history.pushState(Ye, "", i), !!n;
  }
], $f = [], Pf = () => {
  let e = ge(), t = (l, i) => {
    let r = $f.find((s) => s[Xr](l));
    if (r)
      return e.has(l) || r[Kr](l, () => {
        e.get(l)();
      }), e.set(l, i), r;
    H(mr, pt, se, l);
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
      let s = v(r, Ai, () => {
      }), f = v(r, Nl, () => {
      });
      !e.has(l) && !i && s();
      let n = t(l, s);
      !n || i ? s() : (f(), n.play(l, s));
    },
    /**
     * Plays the animation towards the start (in reverse)
     * 
     * When used with hook, this function is usually called after the main hook function
     * 
     * This allows the animation to transition the element into view
     */
    (l, i = !0, r) => {
      let s = v(r, Ai, () => {
      }), f = v(r, Nl, () => {
      }), n = t(l, s);
      n && i ? (f(), n[Vi](l, s)) : s();
    }
  ];
}, Di = (e, t, l) => {
  let i = e.get(t);
  return i && i[l];
}, Nf = (e) => [
  // Adds a hook to a target
  (t, l, i, r = 0) => {
    e.has(t) || e.set(t, {}), e.get(t)[l] || (e.get(t)[l] = ge()), Di(e, t, l).set(i, r);
  },
  // Calls all the functions under a hook name on a target by priority
  async (t, l, i) => {
    let r = Di(e, t, l);
    if (r && B(r)) {
      let s = ct(r);
      si(s, or);
      let f = -1, n = !0, E = async () => {
        if (f++, n = !0, f < B(s)) {
          let a = f;
          await s[a][0](
            /** Contextual data, if any */
            i,
            {
              /** Call the next function */
              play: E,
              /** Disable the auto-run feature and choose when/if to call the next function */
              pause: () => n = !1,
              /** Remove the current function */
              [wt]: () => r[x](s[a][0])
            }
          ), n && await E();
        }
      };
      await E();
    }
  }
], zt = Symbol(), Pt = {}, br = /* @__PURE__ */ new Set(), gf = (e, t) => {
  let l = ge(), i = {
    $http: il,
    $stores: {},
    $plugins: {},
    $state: $e,
    $watch: Ot,
    $effect: Kt
  }, r = { number: ds }, s = {}, f = {}, n = {}, E = {}, a = {}, c = {}, T = "\\p{Letter}", u = {
    "#": /\d/,
    // only numbers
    "&": Vt(`[${T}]`, "u"),
    // only letters (unicode)
    "*": Vt(`[${T}\\d]`, "u")
    // letters and numbers (unicode)
    // H: /[a-f\d]/i, // hexadecimal
  }, I = (o) => l.get(o), y = (o, S = () => !0) => {
    let R = o ? re(o) : Ye;
    for (; R; ) {
      let p = I(R);
      if (p && At(p[Ve]) && S(p)) return p;
      R = re(R);
    }
  }, h = (o, S) => {
    let R = I(o);
    if (!R) {
      let p = S ? I(S) : y(S || o);
      R = {
        // Local context
        // @ts-ignore
        lc: {},
        // Global context
        gc: i,
        // A reference to the element. Convenience for internal use.
        el: o,
        // UID context
        uid: v(p, "uid", {}),
        /** Attributes or directives */
        attr: {},
        /** Cleanup functions */
        cFns: []
      };
      for (let L in hl) {
        let K = hl[L](R, p);
        K && ie(R.lc, L, { v: K, e: !0 });
      }
      l.set(o, R);
    }
    return R;
  }, A = (o, S, R, p) => {
    let L = o.el;
    $(L, S, p(L));
    let K = U(o, R);
    Q(o, Kt(() => O(L, S, K)));
  }, g = (o, S) => {
    Te(o) && (o = M(o)), Te(S) && (S = M(S)), nt(S) || (S = ht), nt(o) && (Hr(o, C), ml(o, async (R) => {
      let p = !1, L = o == R ? S : ht;
      if (Ns(R) && hr(R))
        p = D(R, L);
      else if (at(R)) {
        let K = _e(R);
        if (K == Oe) {
          let W = ci("div");
          Dl(R, (ze, Dr) => St(W, ze, Dr)), W[le] = R[le], ae(R, Jt, W), g(W, L), De(() => ae(W, Jt, ...ue(W)));
        } else
          K == X && ne(Y(R, k + X)) && St(R, k + X, ""), p = await G(R, L);
      }
      return p;
    }));
  }, _ = (o, S = !0, R = !0) => {
    ml(o, (p) => {
      let L = I(p);
      return L && (w(L.cFns, (K) => K()), R && l[x](p), S && ol(p)), !0;
    });
  }, D = (o, S) => {
    let R = o[Ue], p = Lr(Nt(R || ""));
    if (p && He(p, qt)) {
      let L = h(o, S), [K] = U(L, `$el.${Ue}=\`${p}\``, "", !0);
      Q(L, Kt(K)), rl(L, Ne, R);
    }
    return !1;
  }, G = async (o, S) => {
    let R = h(o, S);
    if (!Ge(yt(R))) return !0;
    R[Pe] = Cf(R, k + Pe)();
    for (let [p, L] of Gl) {
      let K = [];
      if (Ps(p))
        Dl(o, (W, ze) => {
          He(W, p) && Z(K, [W, ze]);
        });
      else {
        let W = Y(o, p);
        ne(W) || Z(K, [p, W]);
      }
      for (let [W, ze] of K) {
        if (yt(R)) break;
        rl(R, W, ze), await L(R, W, Nt(ze), C);
      }
      if (yt(R)) break;
    }
    return Ge(yt(R)) && (R.skip = !1), !At(R[Ve]) && !S && l[x](o), !yt(R);
  }, F = hf(g, _, s), [$, O] = Nf(ge()), [m, N] = _f({}, r, F);
  Pt[al] || Mi(N);
  let V = {
    hook: $,
    route: m,
    [as]: r,
    router: Mi,
    [be]: pf,
    [X]: Qe(X, f),
    [Ee]: Qe(Ee, n, Te, Se),
    [Oe]: Qe(Oe, s, Te, Se),
    [Le]: Qe(vt, E),
    data: Qe(_t, a),
    mask: Qe(vl, c),
    [st]: u
  };
  V.mask("money", nf);
  let d = {
    hydrate: g,
    dehydrate: _,
    insert: F,
    route: N,
    emit: xe,
    listen: Ie,
    query: M,
    queryAll: ut,
    /** Get the closest parent element of a target element */
    closest(o, S = pe) {
      let R = y(M(o), (p) => S in p[Ve]);
      return R || H("closest:", Be, pt), R == null ? void 0 : R.el;
    },
    /** Get the local context of an element */
    context: (o) => {
      var S;
      return (S = I(M(o))) == null ? void 0 : S.lc;
    }
  };
  i.$set = V, i.$dom = d, Pt[Wi] = `{${he(ye(i))},${he(ye(hl))}}`;
  let C = {
    ...i,
    newVNode: h,
    getVNode: I,
    eval: U,
    [Ke]: A,
    [ii]: s,
    [Er]: f,
    [kl]: n,
    [st]: u,
    props: E,
    data: a,
    masks: c,
    hooks: [$, O],
    [li]: Pf()
  };
  return w([V, d, il, i, C], (o) => bs(o, { w: !1, c: !1 })), Te(e) && (e = M(e)), e && (at(e) && ne(Y(e, pe)) && St(e, pe, ""), g(e, t)), i;
}, yt = (e) => e.skip, Q = (e, t) => {
  Z(e.cFns, t);
}, rl = (e, t, l) => {
  e[Ve][t] = l, at(e.el) && yl(e.el, t);
}, Nt = (e) => oe(q(he(j(e, se).map((t) => fe(q(t), "//") ? "" : t), se)), /;$/, ""), qt = /\${((?!.*\${).*?)}/, Lr = (e) => {
  let t = /{{((?!.*{{).*?)}}/;
  for (; He(e, t); )
    e = oe(e, t, "${$1}");
  return e;
}, Hr = (e, t) => {
  let l = k + "save";
  if (!at(e)) return;
  let i = ut(Oe + `,[${l}]`, e);
  (Y(e, l) || _e(e) == Oe) && Z(i, e), w(i, (r) => {
    let s = Y(r, l);
    yl(r, l);
    let f = _e(r);
    if (f == Oe && w(ue(r.content), (n) => Hr(n, t)), s) {
      let n = f == X ? X : f == Ee ? Ee : Oe;
      t[n + "s"][s] = Nt(r[le]), ne(Y(r, k + jl)) && ol(r);
    }
  });
}, mi = (e, t, l) => (i, r) => {
  let s = r ? r.lc[e] : Ye;
  return at(i.el) && (!s || !ne(Y(i.el, t))) ? $e({}, { [nl]: l && s }) : s || {};
}, hl = {
  // The element itself
  $el: (e) => e.el,
  // References to `b-ref` elements under the same $data context, not including nested $data contexts
  $refs: (e, t) => !t || at(e.el) && !ne(Y(e.el, pe)) ? {} : t.lc.$refs,
  // Unique identifier for the element
  $uid: (e) => (t) => `${t}-${e.uid[t]}`,
  // Reactive properties defined in the element or inherited from the parent context
  [vt]: mi(vt, sr, !0),
  // The $data context
  [_t]: mi(_t, pe),
  // The $each context
  [jt]: (e, t) => t == null ? void 0 : t.lc[jt]
}, Mi = (e) => Pt[al] = () => e(Gt()), Cf = (e, t, l = "{}") => {
  let i = Nt(Y(e.el, t) || l);
  return rl(e, t, i), U(e, i, "", !1)[0];
}, wf = () => {
  if (!(Rl in me)) {
    let e = {};
    ie(e, "newApp", { v: gf }), ie(me, Rl, { v: e }), Ie(me, ei, ef), Ie(me, "pop" + kt, Pt[al]), xe(me, Rl);
  }
};
wf();
export {
  gf as newApp
};
