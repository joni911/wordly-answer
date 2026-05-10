const DictionaryManager = (() => {
    const DICT_URL = 'data/words.json';

    const FALLBACK_WORDS = [
        'about','above','abuse','actor','acute','admit','adopt','adult',
        'after','again','agent','agree','ahead','alarm','album','alert',
        'alien','align','alike','alive','alone','along','alter','among',
        'angel','anger','angle','angry','ankle','apart','apple','apply',
        'arena','argue','arise','armor','array','aside','asset','avoid',
        'awake','award','aware','awful','basic','basis','beach','began',
        'begin','being','below','bench','bible','birth','black','blade',
        'blame','blank','blast','blaze','bleed','blend','bless','blind',
        'block','blood','blown','board','bonus','boost','bound','brain',
        'brand','brave','bread','break','breed','brick','bride','brief',
        'bring','broad','broke','brown','brush','buddy','build','bunch',
        'burst','buyer','cabin','cable','carry','catch','cause','chain',
        'chair','chaos','charm','chart','chase','cheap','check','cheek',
        'chess','chest','chief','child','china','chunk','civil','claim',
        'clash','class','clean','clear','climb','cling','clock','close',
        'cloth','cloud','coach','coast','color','comet','comic','coral',
        'couch','could','count','court','cover','crack','craft','crash',
        'crazy','cream','crime','cross','crowd','crown','crush','curve',
        'cycle','daily','dance','death','debut','decay','delay','delta',
        'dense','depth','devil','diary','dirty','doubt','dozen','draft',
        'drain','drama','drank','drawn','dream','dress','dried','drift',
        'drill','drink','drive','droit','drops','drove','drugs','drunk',
        'dryer','dying','eager','early','earth','eight','elder','elect',
        'elite','ember','empty','enemy','enjoy','enter','entry','equal',
        'error','essay','event','every','exact','exam','exile','exist',
        'extra','fable','faith','false','fancy','fatal','fault','feast',
        'fence','ferry','fever','fiber','field','fifth','fifty','fight',
        'final','first','fixed','flame','flash','fleet','flesh','float',
        'flood','floor','flora','flour','fluid','flush','focal','focus',
        'force','forge','forth','forum','found','frame','frank','fraud',
        'fresh','front','frost','froze','fruit','fully','funny','giant',
        'given','glass','gleam','glide','globe','gloom','glory','gloss',
        'glove','going','grace','grade','grain','grand','grant','graph',
        'grasp','grass','grave','great','greed','green','greet','grief',
        'grill','grind','groan','gross','group','grove','grown','guard',
        'guess','guest','guide','guild','guilt','habit','happy','harsh',
        'heart','heavy','hence','herbs','honor','horse','hotel','house',
        'human','humor','hurry','hyper','ideal','image','imply','index',
        'indie','inner','input','irony','ivory','jewel','joint','joker',
        'judge','juice','juicy','knock','known','label','labor','lance',
        'large','laser','later','laugh','layer','learn','lease','least',
        'leave','legal','level','light','limit','linen','liver','lodge',
        'logic','login','lonely','loose','lover','lower','loyal','lucky',
        'lunch','lunar','lying','magic','major','maker','manor','maple',
        'march','marry','match','mayor','media','mercy','merge','merit',
        'metal','meter','midst','might','minor','minus','mixed','model',
        'money','month','moral','motor','mount','mouse','mouth','moved',
        'mover','movie','multi','mural','music','naive','nasty','naval',
        'nerve','never','newly','night','noble','noise','north','noted',
        'novel','nurse','nylon','occur','ocean','offer','often','olive',
        'onset','opera','orbit','order','organ','other','ought','outer',
        'owned','owner','oxide','ozone','paint','panel','panic','paper',
        'party','paste','patch','pause','peace','pearl','penny','phase',
        'phone','photo','piano','piece','pilot','pitch','pixel','pizza',
        'place','plain','plane','plant','plate','plaza','plead','pluck',
        'plumb','plume','plunge','poetry','point','polar','porch','poser',
        'pound','power','press','price','pride','prime','prince','print',
        'prior','prize','probe','prone','proof','prose','proud','prove',
        'psalm','pulse','pupil','purse','queen','query','quest','queue',
        'quick','quiet','quite','quota','quote','radar','radio','raise',
        'rally','ranch','range','rapid','ratio','reach','react','ready',
        'realm','rebel','refer','reign','relax','reply','rider','ridge',
        'rifle','right','rigid','risky','rival','river','robin','robot',
        'rocky','rouge','rough','round','route','royal','rugby','ruler',
        'rural','sadly','saint','salad','sauce','scale','scare','scene',
        'scent','scope','score','scout','scrap','sense','serve','setup',
        'seven','shade','shaft','shake','shall','shame','shape','share',
        'sharp','sheep','sheer','sheet','shelf','shell','shift','shine',
        'shirt','shock','shoot','shore','short','shout','sight','sigma',
        'silly','since','sixth','sixty','sized','skill','skull','slash',
        'slate','slave','sleep','slice','slide','slope','smart','smell',
        'smile','smoke','snake','solar','solid','solve','sorry','sound',
        'south','space','spare','spark','speak','speed','spend','spent',
        'spice','spine','spite','split','spoke','spoon','sport','spray',
        'squad','stack','staff','stage','stain','stake','stale','stall',
        'stamp','stand','stare','stark','start','state','stays','steady',
        'steam','steel','steep','steer','stern','stick','stiff','still',
        'stock','stole','stone','stood','store','storm','story','stove',
        'strap','straw','stray','strip','stuck','study','stuff','style',
        'sugar','suite','super','surge','swamp','swear','sweat','sweet',
        'swept','swift','swing','sword','sworn','syrup','table','taste',
        'teach','teeth','tempo','tense','terms','theft','theme','thick',
        'thing','think','third','those','three','threw','throw','thumb',
        'tiger','tight','timer','tired','title','toast','today','token',
        'total','touch','tough','tower','toxic','trace','track','trade',
        'trail','train','trait','trash','treat','trend','trial','tribe',
        'trick','tried','troop','truck','truly','trump','trunk','trust',
        'truth','tumor','twice','twist','ultra','uncle','under','unify',
        'union','unite','unity','until','upper','upset','urban','usage',
        'usual','utter','valid','value','valve','vault','venue','verse',
        'video','vigor','vinyl','viral','virus','visit','vista','vital',
        'vivid','vocal','voice','voter','wagon','waste','watch','water',
        'weary','weave','wedge','weigh','weird','whale','wheat','wheel',
        'where','which','while','white','whole','whose','width','witch',
        'woman','women','world','worry','worse','worst','worth','would',
        'wound','wrath','write','wrong','wrote','yacht','yield','young',
        'youth','zebra'
    ];

    let words = [];
    let loaded = false;

    async function loadDictionary() {
        if (loaded) return words;

        try {
            const response = await fetch(DICT_URL);
            if (response.ok) {
                words = await response.json();
                if (words.length > 100) {
                    loaded = true;
                    return words;
                }
            }
        } catch (e) {
            console.warn(`Failed to load from ${DICT_URL}:`, e);
        }

        words = FALLBACK_WORDS.slice();
        loaded = true;
        return words;
    }

    function getWords() {
        return words;
    }

    function isLoaded() {
        return loaded;
    }

    function isValidWord(word) {
        return words.includes(word.toLowerCase());
    }

    return {
        loadDictionary,
        getWords,
        isLoaded,
        isValidWord
    };
})();
