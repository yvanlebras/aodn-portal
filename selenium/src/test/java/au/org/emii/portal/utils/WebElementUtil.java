package au.org.emii.portal.utils;

import org.apache.log4j.Logger;
import org.openqa.selenium.*;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

public class WebElementUtil {

    private static Logger log = Logger.getLogger(WebElementUtil.class.getName());

    protected WebDriver driver;
    protected final int TIMEOUT = 30;
    protected final int POLLING_PERIOND = 1;
    protected String originalHandle;

    public WebElementUtil(WebDriver driver) {
        this.driver = driver;
        this.originalHandle = driver.getWindowHandle();
    }

    public void clickElementByXpath(String xpath) {
        try {
            click(By.xpath(xpath));
        } catch (NoSuchElementException | AssertionError e) {
            log.error("Element with xpath " + xpath + "could not be found", e);
            throw e;
        }
    }

    public void clickElementWithLinkText(String linkText) {
        try {
            click(By.linkText(linkText));
        } catch (NoSuchElementException | AssertionError e) {
            log.error("Link text " + linkText + "could not be found", e);
            throw e;
        }
    }

    public void clickLinkContainingText(String linkText) {
        clickLinkContainingText(linkText, false);
    }

    public void clickLinkContainingText(String linkText, boolean defaultClick) {
        try {
            if (defaultClick)
                defaultClick(By.xpath("//a[contains(.,'" + linkText + "')]"));
            else
                click(By.xpath("//a[contains(.,'" + linkText + "')]"));
        } catch (NoSuchElementException | AssertionError e) {
            log.error("Link text " + linkText + "could not be found", e);
            throw e;
        }
    }

    public void clickLinkWithTitle(String title) {
        try {
            By xpath = By.xpath("//a[contains(@title, '" + title + "')]");
            click(xpath);
        } catch (NoSuchElementException | AssertionError e) {
            log.error("Button with title " + title + " cannot be found", e);
            throw e;
        }
    }

    public void clickButtonWithText(String text) {
        try {
            click(By.xpath("//button[contains(.,'" + text + "')]"));
        } catch (NoSuchElementException | AssertionError e) {
            log.error(text + " element cannot be found", e);
            throw e;
        }
    }

    public void clickElementById(String id) {
        try {
            click(By.id(id));
        } catch (NoSuchElementException | AssertionError e) {
            log.error("Element with id " + id + " cannot be found", e);
            throw e;
        }
    }

    public void clickElementWithClass(String className) {
        try {
            click(By.xpath("[contains(@class, '" + className + "')]"));
        } catch (NoSuchElementException | AssertionError e) {
            log.error("Element with class " + className + " cannot be found", e);
            throw e;
        }
    }

    public void clickButtonWithClass(String className) {
        try {
            click(By.xpath("//button[contains(@class, '" + className + "')]"));
        } catch (NoSuchElementException | AssertionError e) {
            log.error("Element with class " + className + " cannot be found", e);
            throw e;
        }
    }

    public void clickButtonWithTitle(String title) {
        try {
            By xpath = By.xpath("//button[contains(@title, '" + title + "')]");
            click(xpath);
        } catch (NoSuchElementException | AssertionError e) {
            log.error("Button with title " + title + " cannot be found", e);
            throw e;
        }
    }

    public void clickButtonWithId(String id) {
        try {
            click(By.id(id));
        } catch (NoSuchElementException | AssertionError e) {
            log.error("Button with id " + id + " cannot be found", e);
            throw e;
        }
    }

    public void selectDropDownTextById(String selectText, String selectId) {
        try {
            WebElement element = findElement(By.id(selectId));
            Assert.assertNotNull(element);
            Select dropdown = new Select(element);
            dropdown.selectByVisibleText(selectText);
        } catch (NoSuchElementException | AssertionError e) {
            log.error(selectText + " could not be selected", e);
            throw e;
        }
    }

    public void selectDropDownTextByClass(String selectText, String className) {
        try {
            WebElement element = findElement(By.xpath("[contains(@class, '" + className + "')]"));
            Assert.assertNotNull(element);
            Select dropdown = new Select(element);
            dropdown.selectByVisibleText(selectText);
        } catch (NoSuchElementException | AssertionError e) {
            log.error(selectText + " could not be selected", e);
            throw e;
        }
    }

    public void selectDropDownTextByXpath(String selectText, String xpath) {
        try {
            WebElement element = findElement(By.xpath(xpath));
            Assert.assertNotNull(element);
            Select dropdown = new Select(element);
            dropdown.selectByVisibleText(selectText);
        } catch (NoSuchElementException | AssertionError e) {
            log.error(selectText + " could not be selected", e);
            throw e;
        }
    }

    public void enterInputStringById(String inputString, String inputId) {
        try {
            WebElement element = findElement(By.id(inputId));
            Assert.assertNotNull(element);
            element.clear();
            element.sendKeys(new String[]{inputString});
        } catch (NoSuchElementException | AssertionError e) {
            log.error(inputString + " field with id " + inputId + " could not be found", e);
            throw e;
        }
    }

    public void enterInputStringByXpath(String inputString, String xpath) {
        try {
            WebElement element = findElement(By.xpath(xpath));
            Assert.assertNotNull(element);
            element.clear();
            element.sendKeys(new String[]{inputString});
        } catch (NoSuchElementException | AssertionError e) {
            log.error(inputString + " field with xpath " + xpath + " could not be found", e);
            throw e;
        }
    }

    public void clearInputById(String inputId) {
        try {
            WebElement element = findElement(By.id(inputId));
            Assert.assertNotNull(element);
            element.clear();
        } catch (NoSuchElementException | AssertionError e) {
            log.error(" Field with id " + inputId + " could not be found", e);
            throw e;
        }
    }

    public void verifyInputText(String inputId, String matchText) {
        try {
            WebElement element = findElement(By.id(inputId));
            Assert.assertNotNull(element);
            Assert.assertTrue(element.getAttribute("value").equals(matchText), "Unable to math text: " + matchText);
        } catch (NoSuchElementException | AssertionError e) {
            log.error(" Field with id " + inputId + " could not be found", e);
            throw e;
        }
    }

    public void clearInputByXpath(String xpath) {
        try {
            WebElement element = findElement(By.xpath(xpath));
            Assert.assertNotNull(element);
            element.clear();
        } catch (NoSuchElementException | AssertionError e) {
            log.error(" Field with xpath " + xpath + " could not be found", e);
            throw e;
        }
    }


    public void verifyValidationMessage(String validationMessage) {
        try {
            WebElement element = findElement(By.xpath("//span[contains(.,'" + validationMessage + "')]"));
            Assert.assertNotNull(element);
        } catch (NoSuchElementException | AssertionError e) {
            log.error("Validation Message " + validationMessage + " could not be found", e);
            throw e;
        }
    }

    public void verifyTextPresentOnPage(String text) {
        WebDriverWait wait = new WebDriverWait(driver, 10);
        wait.until(ExpectedConditions.textToBePresentInElementLocated(By.tagName("body"),text));
    }

    public void verifyPageTitle(String title) {

        WebDriverWait wait = new WebDriverWait(driver, 30);
        wait.until(ExpectedConditions.titleContains(title));
    }

    public void verifyInnerHtml(String innerHtml) {
        try {
            Assert.assertTrue(driver.getPageSource().contains(innerHtml));
        } catch (AssertionError e) {
            log.error("Assertion Failed", e);
            log.error(String.format("Expected Content:%s", innerHtml));
            log.error(String.format("Page Content:%s", driver.getPageSource()));
            throw e;
        }
    }

    public boolean isElementClickable(By locator) {
        WebElement element = findElement(locator);
        return (element != null && element.isDisplayed() && element.isEnabled()) ? true : false;
    }

    public void acceptAlert(WebDriver driver) {
        // Check the presence of alert
        Alert alert = driver.switchTo().alert();
        // if present consume the alert
        alert.accept();
    }

    public void cancelAlert(WebDriver driver) {
        // Check the presence of alert
        Alert alert = driver.switchTo().alert();
        // if present consume the alert
        alert.dismiss();
    }

    public void clickMap(WebElement mapPanel, int xOffset, int yOffset) {
        Actions builder = new Actions(driver);
        builder.moveToElement(mapPanel, xOffset, yOffset).click().build().perform();
    }

    public List<WebElement> findElements(By by) {
        List<WebElement> elements = null;
        FluentWait<WebDriver> wait = new FluentWait<>(driver)
                .withTimeout(TIMEOUT, TimeUnit.SECONDS)
                .pollingEvery(POLLING_PERIOND, TimeUnit.SECONDS)
                .ignoring(NoSuchElementException.class)
                .ignoring(StaleElementReferenceException.class);
        int attempts = 1, totalAttempts = 2;
        while(attempts <= totalAttempts) {
            try {
                elements = wait.until(
                        ExpectedConditions.presenceOfAllElementsLocatedBy(by));
                break;
            } catch(NoSuchElementException | TimeoutException | StaleElementReferenceException e) {
                log.info(String.format("Unable to find elements %s. Attempt: %s Total Attempts: %s. Error:%s", by.toString(), attempts, totalAttempts, e.getMessage()));
            }
            attempts++;
        }
        return elements;
    }

    public WebElement findElement(By by) {
        WebElement element = null;
        FluentWait<WebDriver> wait = new FluentWait<>(driver)
                .withTimeout(TIMEOUT, TimeUnit.SECONDS)
                .pollingEvery(POLLING_PERIOND, TimeUnit.SECONDS)
                .ignoring(NoSuchElementException.class)
                .ignoring(StaleElementReferenceException.class);
        int attempts = 1, totalAttempts = 2;
        while(attempts <= totalAttempts) {
            try {
                element = wait.until(
                        ExpectedConditions.presenceOfElementLocated(by));
                break;
            } catch(NoSuchElementException | TimeoutException | StaleElementReferenceException e) {
                log.info(String.format("Unable to find element %s. Attempt: %s Total Attempts: %s. Error:%s", by.toString(), attempts, totalAttempts, e.getMessage()));
            }
            attempts++;
        }
        return element;
    }

    public WebElement waitForElement(By by) {
        return findElement(by);
    }

    public void waitForInvisibilityOfElement(By by) {
        int attempts = 1, totalAttempts = 2;
        while(attempts <= totalAttempts) {
            try {
                WebDriverWait wait = new WebDriverWait(driver, TIMEOUT);
                wait.until(ExpectedConditions.invisibilityOfElementLocated(by));
            } catch(Exception e) {
                log.debug(String.format("Element still visible %s. Attempt: %s Total Attempts: %s", by.toString(), attempts, totalAttempts));
                log.debug(String.format("Error:%s", e.getMessage()));
            }
            attempts++;
        }
    }

    public void click(By by, WebElement element) {
        int attempts = 1, totalAttempts = 2;
        while(attempts <= totalAttempts) {
            try {
                if (element == null) {
                    element = findElement(by);
                    Assert.assertNotNull(element);
                }
                WebDriverWait wait = new WebDriverWait(driver, TIMEOUT);
                wait.until(ExpectedConditions.elementToBeClickable(element));
                element.sendKeys(Keys.RETURN); // element.click() does not work in some environments
                break;
            } catch(Exception e) {
                log.debug(String.format("Unable to click element %s. Attempt: %s Total Attempts: %s", by.toString(), attempts, totalAttempts));
                log.debug(String.format("Error:%s", e.getMessage()));
            }
            attempts++;
        }
    }

    public void defaultClick(By by, WebElement element) {
        int attempts = 1, totalAttempts = 2;
        while(attempts <= totalAttempts) {
            try {
                if (element == null) {
                    element = findElement(by);
                    Assert.assertNotNull(element);
                }
                WebDriverWait wait = new WebDriverWait(driver, TIMEOUT);
                wait.until(ExpectedConditions.elementToBeClickable(element));
                element.click();
                break;
            } catch(Exception e) {
                log.debug(String.format("Unable to click element %s. Attempt: %s Total Attempts: %s", by.toString(), attempts, totalAttempts));
                log.debug(String.format("Error:%s", e.getMessage()));
            }
            attempts++;
        }
    }

    public void defaultClick(By by) {
        defaultClick(by, null);
    }

    public void click(By by) {
        click(by, null);
    }

    public void click(WebElement element) {
        click(null, element);
    }

    public void switchToNewTab() {
        waitForNumberOfWindowsToEqual(2);
        ArrayList<String> tabs = new ArrayList<>(driver.getWindowHandles());
        driver.switchTo().window(tabs.get(1));
    }

    public void switchToOriginalTab() {
        for(String handle : driver.getWindowHandles()) {
            if (!handle.equals(originalHandle)) {
                driver.switchTo().window(handle);
                driver.close();
            }
        }

        driver.switchTo().window(originalHandle);
    }

    public void clickElementBy(By by) {
        click(by);
    }

    public void clickElementAt(int x, int y) {
        WebElement element = (WebElement)executeScript(
                "return document.elementFromPoint(arguments[0], arguments[1]);", x, y);
        element.click();
    }

    private Object executeScript(String s, Object... args) {
        if (driver instanceof JavascriptExecutor) {
            return ((JavascriptExecutor)driver).executeScript(s, args);
        } else {
            throw new IllegalStateException("This driver does not support JavaScript!");
        }
    }

    public void waitForNumberOfWindowsToEqual(final int numberOfWindows) {
        new WebDriverWait(driver, TIMEOUT) {
        }.until(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver driver) {
                return (driver.getWindowHandles().size() == numberOfWindows);
            }
        });
    }

    public void waitUntilAnimationIsDone(final String cssLocator)
    {
        WebDriverWait wdw = new WebDriverWait(driver, 20, 300);
        ExpectedCondition<Boolean> expectation = new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver driver) {
                String temp = ((JavascriptExecutor)driver)
                        .executeScript("return jQuery('."+cssLocator+"').is(':animated')").toString();
                return  temp.equalsIgnoreCase("false");
            }
        };

        try{
            wdw.until(expectation);
        }catch(TimeoutException e){
            throw new AssertionError("Element animation is not finished in time. Css locator: " + cssLocator);
        }
    }
}


