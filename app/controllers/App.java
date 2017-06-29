package controllers;

import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.commons.lang.ArrayUtils;
import org.apache.commons.lang.StringUtils;
import play.Play;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.LineNumberReader;
import java.util.*;
import java.util.stream.Collectors;

public class App extends Controller {

    private static String[] scrambleWord(String word) {
        List<Character> chars = toCharacterList(word);
        Collections.shuffle(chars);
        String[] shuffled = new String[chars.size()];
        for (int i = 0; i < shuffled.length; i++) {
            shuffled[i] = chars.get(i).toString();
        }
        return shuffled;
    }

    public static Result app() {
        return ok(views.html.game.render());
    }

    public static Result game() throws IOException {
        // clear session
        session().clear();

        // get words source
        File source = Play.application().getFile("app/assets/words.txt");

        // get source's line number
        LineNumberReader lnr = new LineNumberReader(new FileReader(source));
        lnr.skip(Long.MAX_VALUE);
        int numWords = lnr.getLineNumber();
        lnr.close();

        // pick random word and generate set of correct answers
        Random generator = new Random();
        int radomWord = generator.nextInt(numWords - 1);
        String realWord = "";
        String shuffedWord;
        Scanner words = new Scanner(source);
        List<String> allWords = new ArrayList<>();
        for (int i = 0; i < numWords; i++) {
            allWords.add(words.nextLine());
        }
        realWord = allWords.get(radomWord - 1);
        List<String> correctWordsList = generateCorrectWords(realWord, allWords);
        words.close();

        // shuffle the original word
        shuffedWord = StringUtils.join(scrambleWord(realWord), '-');

        String correctWords = " - " + StringUtils.join(correctWordsList.toArray(), " - ");

        System.out.println("correct words: " + correctWords);

        session("realWord", realWord);
        session("correctWords", correctWords);
        System.out.println("shuffle word: " + shuffedWord);
        System.out.println("real word: " + realWord);
        return ok(views.html.gameAjax.render(numWords, realWord, shuffedWord, correctWords));
    }

    public static Result checkResult(String answer) {
        String[] arr = session("correctWords").split(" - ");
        List<String> correctWords = Arrays.asList(arr);
        //JsonNode json = request().body().asJson();
        ObjectNode result = Json.newObject();
        if (correctWords.contains(answer)) {
            if (correctWords.size() == 2) {
                result.put("status", "2");
            } else
                result.put("status", "1");
            arr = (String[]) ArrayUtils.removeElement(arr, answer);
            session("correctWords", StringUtils.join(arr, " - "));
        } else {
            result.put("status", "0");
        }

        return ok(result);
    }

    public static Result getCorrectWords() {
        String correctWords = session("correctWords");
        ObjectNode result = Json.newObject();
        result.put("correctWords", correctWords);

        return ok(result);
    }

    private static boolean containsValidChars(String word, String realWord) {
        List<Character> wordChars = toCharacterList(word);

        List<Character> validChars = toCharacterList(realWord);

        if (!wordChars.isEmpty() && !validChars.isEmpty()) {
            return containsAll(wordChars, validChars);
        }

        return false;
    }

    private static boolean containsAll(List<Character> wordChars, List<Character> validChars) {
        for (Character c : wordChars) {
            if (!validChars.contains(c))
                return false;
            int occurrencesInStandard = Collections.frequency(validChars, c);
            int occurrencesBeChecked = Collections.frequency(wordChars, c);
            if (occurrencesBeChecked > occurrencesInStandard)
                return false;
        }

        return true;
    }

    private static List<String> generateCorrectWords(String realWord, List<String> allWords) {
        List<String> results = allWords.stream().filter(w -> containsValidChars(w, realWord)).collect(Collectors.toList());

        return results;
    }

    private static List<Character> toCharacterList(String word) {
        List<Character> chars = new ArrayList<>();
        for (char c : word.toCharArray()) {
            chars.add(c);
        }
        return chars;
    }


}
