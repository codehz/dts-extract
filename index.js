import { readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { createCompilerHost, createProgram, flattenDiagnosticMessageText, parseConfigFileTextToJson, parseJsonConfigFileContent, sys, } from "typescript";
function reportDiagnostic(diagnostic) {
    throw new Error(flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
}
export function extractDts(configfile, mapping) {
    const json = parseConfigFileTextToJson(configfile, readFileSync(configfile, { encoding: "utf-8" }));
    if (json.error)
        reportDiagnostic(json.error);
    const result = parseJsonConfigFileContent(json.config, sys, dirname(configfile));
    if (result.errors.length)
        reportDiagnostic(result.errors[0]);
    const compiler = createCompilerHost(result.options);
    compiler.writeFile = (filename, text, bom, onError, [src] = []) => {
        if (src && src.fileName in mapping) {
            writeFileSync(mapping[src.fileName], text);
        }
    };
    const program = createProgram(Object.keys(mapping), result.options, compiler);
    program.emit();
}
