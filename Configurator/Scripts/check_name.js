function check_name(name) {
    return name !== "blank" && ProfileCodec.validName(name)
        ? true : "Use a Python identifier that is not a reserved setting name.";
}
