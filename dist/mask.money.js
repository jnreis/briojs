let u = "length", N = "object", P = "replace", w = "start", A = "toString", C = "tokens", I = "type", m, d = "value", x = "With", D = "proto" + I, L = w + "s" + x, W = (e, t) => e.join(t), _ = (e) => e.toLowerCase(), j = (e, t, l) => e.split(t, l), v = (e, t, l) => e[L](t, l), O = (e, t, l) => e[P](t, l), z = (e) => _(S(K[D][A].call(e), 8, -1)), H = (e, t) => z(e) === t, U = (e) => e === m, G = (e) => H(e, N), K = Object, V = RegExp, f = (e, t, l) => G(e) && t in e ? e[t] : l, Y = (e, t) => new V(e, t), S = (e, t, l) => e.slice(t, l), R = (e) => U(e[u]) ? e.size : e[u], b = (e) => {
  let t = e[d], l = f(e, "decimal", "."), o = f(e, "thousands", ","), E = f(e, "precision", 2);
  l == "," && (o = "."), o == "." && (l = ",");
  let r = j(t, l), i = r[0], a = v(i, "-");
  i = O(i, /\D/g, ""), i = i && (O(i, /^0+/, "") || "0");
  let g = R(r) > 1, y = g ? W(S(r, 1), l) : "", p = R(i), n = a ? "-" : "";
  for (let s = 0; s < p; s++)
    s > 0 && (p - s) % 3 == 0 && (n += o), n += "#";
  let c = e[C];
  t = a ? "-" + i : i, E > 0 && (c[l] = Y(`\\${l}`), g && (t += l + y), n += l + "#" + E), e.mask = n, a && (c["-"] = /-/), c["#"] = /\d/;
  let h = 0, T = "";
  for (let s of e[d])
    s == t[h] ? (T += s, h++) : T += "∅";
  e[d] = T;
};
try {
  $set.mask("money", b);
} catch {
  console.error('Could not set the "money" mask.');
}
